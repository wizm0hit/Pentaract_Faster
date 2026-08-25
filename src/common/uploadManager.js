import { createRoot, createSignal } from 'solid-js'
import API from '../api'
import { alertStore } from '../components/AlertStack'

/**
 * Calculates optimal chunk size based on file size:
 * - <= 50MB: 5MB chunks
 * - 50MB to 500MB: 10MB chunks
 * - > 500MB: 16MB chunks (efficient for multi-GB uploads up to Telegram's 50MB limit)
 */
export function calculateOptimalChunkSize(fileSize) {
	if (fileSize > 500 * 1024 * 1024) {
		return 16 * 1024 * 1024 // 16 MB
	} else if (fileSize > 50 * 1024 * 1024) {
		return 10 * 1024 * 1024 // 10 MB
	}
	return 5 * 1024 * 1024 // 5 MB
}

/**
 * Format bytes to readable speed string
 */
function formatSpeed(bytesPerSec) {
	if (!bytesPerSec || bytesPerSec <= 0) return ''
	if (bytesPerSec > 1024 * 1024) {
		return `${(bytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`
	}
	return `${(bytesPerSec / 1024).toFixed(0)} KB/s`
}

/**
 * Format remaining time in seconds to human readable string
 */
function formatEta(seconds) {
	if (!seconds || seconds <= 0 || !isFinite(seconds)) return ''
	if (seconds < 60) {
		return `${Math.round(seconds)}s left`
	}
	const mins = Math.floor(seconds / 60)
	const secs = Math.round(seconds % 60)
	return `${mins}m ${secs}s left`
}

/**
 * @typedef {Object} UploadTask
 * @property {string} id
 * @property {'upload' | 'download'} [type]
 * @property {string} storageId
 * @property {string} fileName
 * @property {number} fileSize
 * @property {string} targetPath
 * @property {number} progress // 0 to 100
 * @property {number} currentChunk
 * @property {number} totalChunks
 * @property {string} stage
 * @property {'uploading' | 'downloading' | 'completed' | 'error' | 'cancelled'} status
 * @property {string} [errorMessage]
 * @property {string[]} workerNames
 * @property {number[]} telegramMessageIds
 * @property {number} startedAt
 * @property {number} [completedAt]
 * @property {string} [speed]
 * @property {string} [eta]
 * @property {AbortController} [abortController]
 */

export const uploadManager = createRoot(() => {
	const [tasks, setTasks] = createSignal([])
	const [isMinimized, setIsMinimized] = createSignal(false)
	const [isDockOpen, setIsDockOpen] = createSignal(false)

	const activeCount = () =>
		tasks().filter((t) => t.status === 'uploading' || t.status === 'downloading').length

	const updateTask = (id, updater) => {
		setTasks((prev) =>
			prev.map((t) => {
				if (t.id === id) {
					return typeof updater === 'function' ? updater(t) : { ...t, ...updater }
				}
				return t
			})
		)
	}

	const uploadChunkWithRetry = async (storageId, chunkData, onProgress, maxRetries = 5, abortSignal, onRetry) => {
		for (let attempt = 1; attempt <= maxRetries; attempt++) {
			if (abortSignal?.aborted) {
				throw new Error('Upload cancelled by user')
			}
			try {
				return await API.files.uploadChunk(storageId, chunkData, onProgress, true)
			} catch (err) {
				if (abortSignal?.aborted) throw err
				if (attempt === maxRetries) {
					throw new Error(`Slice ${chunkData.chunk_index + 1}/${chunkData.total_chunks} failed after ${maxRetries} attempts: ${err.message}`)
				}
				const backoffDelay = Math.min(1000 * Math.pow(1.8, attempt) + Math.random() * 500, 10000)
				if (onRetry) {
					onRetry(attempt, maxRetries, backoffDelay, err.message)
				}
				await new Promise((r) => setTimeout(r, backoffDelay))
			}
		}
	}

	const startUpload = async (storageId, targetPath, file) => {
		if (!file) return

		const taskId = 'up_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now()
		const chunkSize = calculateOptimalChunkSize(file.size)
		const totalChunks = Math.ceil(file.size / chunkSize) || 1
		const abortController = new AbortController()

		const initialTask = {
			id: taskId,
			storageId,
			fileName: file.name,
			fileSize: file.size,
			targetPath: targetPath || '',
			progress: 0,
			currentChunk: 0,
			totalChunks,
			stage: totalChunks > 1 
				? `Slicing into ${totalChunks} encrypted slices & streaming to Telegram...`
				: 'Encrypting with AES-256-GCM & streaming to Telegram...',
			status: 'uploading',
			workerNames: [],
			telegramMessageIds: [],
			startedAt: Date.now(),
			speed: '',
			eta: '',
			abortController,
		}

		setTasks((prev) => [initialTask, ...prev])
		setIsDockOpen(true)
		setIsMinimized(false)

		let bytesTransferred = 0
		const startTime = Date.now()

		try {
			// Stream slice-by-slice directly to Telegram group
			for (let i = 0; i < totalChunks; i++) {
				if (abortController.signal.aborted) {
					throw new Error('Upload cancelled by user')
				}

				const start = i * chunkSize
				const end = Math.min(start + chunkSize, file.size)
				const currentChunkBytes = end - start
				const chunkBlob = file.slice(start, end)

				updateTask(taskId, (t) => ({
					...t,
					currentChunk: i + 1,
					stage: `Streaming slice ${i + 1}/${totalChunks} directly to Telegram group...`,
				}))

				const response = await uploadChunkWithRetry(
					storageId,
					{
						chunk: chunkBlob,
						chunk_index: i,
						total_chunks: totalChunks,
						path: targetPath || '',
						file_name: file.name,
						total_size: file.size,
						mime_type: file.type || 'application/octet-stream',
					},
					(chunkPct) => {
						const currentSliceDone = (chunkPct / 100) * currentChunkBytes
						const totalDone = bytesTransferred + currentSliceDone
						const overall = Math.round((totalDone / file.size) * 100)

						const elapsedSec = (Date.now() - startTime) / 1000
						const speedBps = elapsedSec > 0 ? totalDone / elapsedSec : 0
						const remainingBytes = file.size - totalDone
						const etaSec = speedBps > 0 ? remainingBytes / speedBps : 0

						updateTask(taskId, {
							progress: Math.min(99, Math.max(0, overall)),
							speed: formatSpeed(speedBps),
							eta: formatEta(etaSec),
						})
					},
					5,
					abortController.signal,
					(attempt, maxRetries, delayMs, errMsg) => {
						const waitSec = Math.round(delayMs / 1000)
						updateTask(taskId, {
							stage: `Retrying slice ${i + 1}/${totalChunks} in ${waitSec}s (attempt ${attempt}/${maxRetries}): ${errMsg}`,
						})
					}
				)

				bytesTransferred += currentChunkBytes
				const workerName = response?.worker_name || 'Telegram Worker'
				const tgMsgId = response?.telegram_message_id

				updateTask(taskId, (t) => {
					const updatedWorkers = t.workerNames.includes(workerName) ? t.workerNames : [...t.workerNames, workerName]
					const updatedTgIds = tgMsgId ? [...t.telegramMessageIds, tgMsgId] : t.telegramMessageIds
					const newProgress = Math.round(((i + 1) / totalChunks) * 100)

					const elapsedSec = (Date.now() - startTime) / 1000
					const speedBps = elapsedSec > 0 ? bytesTransferred / elapsedSec : 0
					const remainingBytes = file.size - bytesTransferred
					const etaSec = speedBps > 0 ? remainingBytes / speedBps : 0

					return {
						...t,
						progress: newProgress,
						workerNames: updatedWorkers,
						telegramMessageIds: updatedTgIds,
						speed: formatSpeed(speedBps),
						eta: formatEta(etaSec),
						stage: i + 1 === totalChunks
							? 'All slices encrypted & streamed to Telegram group!'
							: `Slice ${i + 1}/${totalChunks} posted to Telegram (${workerName})`,
					}
				})
			}

			// Finalize completion
			updateTask(taskId, {
				status: 'completed',
				progress: 100,
				completedAt: Date.now(),
				speed: '',
				eta: '',
				stage: 'Encrypted with AES-256-GCM & stored in Telegram group',
			})

			alertStore.addAlert(`Uploaded "${file.name}" directly to Telegram`, 'success')

			// Dispatch global event for views to refresh
			window.dispatchEvent(
				new CustomEvent('pentaract:file_uploaded', {
					detail: { storageId, targetPath, fileName: file.name },
				})
			)
		} catch (err) {
			if (abortController.signal.aborted) {
				updateTask(taskId, {
					status: 'cancelled',
					stage: 'Upload cancelled',
					speed: '',
					eta: '',
				})
			} else {
				console.error('Direct Telegram upload failed:', err)
				updateTask(taskId, {
					status: 'error',
					errorMessage: err.message || 'Direct upload to Telegram failed',
					stage: `Upload failed: ${err.message || 'Network error'}`,
					speed: '',
					eta: '',
				})
				alertStore.addAlert(`Failed to upload "${file.name}": ${err.message}`, 'error')
			}
		}
	}

	const startDownload = async (storageId, filePath, fileName, fileSize = 0) => {
		const taskId = 'dl_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now()
		const name = fileName || filePath.split('/').pop() || 'download.bin'
		const abortController = new AbortController()

		const initialTask = {
			id: taskId,
			type: 'download',
			storageId,
			fileName: name,
			fileSize: fileSize || 0,
			targetPath: filePath || '',
			progress: 0,
			currentChunk: 1,
			totalChunks: 1,
			stage: 'Initializing in-browser decryption buffer...',
			status: 'downloading',
			workerNames: ['Active Cluster'],
			telegramMessageIds: [],
			startedAt: Date.now(),
			speed: '',
			eta: '',
			abortController,
		}

		setTasks((prev) => [initialTask, ...prev])
		setIsDockOpen(true)
		setIsMinimized(false)

		const downloadStartTime = Date.now()
		let lastSampleTime = downloadStartTime
		let lastSampleLoaded = 0

		try {
			updateTask(taskId, {
				stage: 'Downloading and decrypting AES-256 slices into browser memory...',
			})

			const blob = await API.files.download(
				storageId,
				filePath,
				(percent, loaded, total) => {
					const now = Date.now()
					const timeDelta = (now - lastSampleTime) / 1000

					let speedStr = ''
					let etaStr = ''

					if (timeDelta >= 0.5 && loaded > lastSampleLoaded) {
						const bytesDelta = loaded - lastSampleLoaded
						const bps = bytesDelta / timeDelta
						speedStr = formatSpeed(bps)
						if (total && total > loaded && bps > 0) {
							const remainingSecs = (total - loaded) / bps
							etaStr = formatEta(remainingSecs)
						}
						lastSampleTime = now
						lastSampleLoaded = loaded
					}

					updateTask(taskId, {
						progress: percent,
						fileSize: total || fileSize || loaded,
						stage: `Downloading in-browser: ${convertSize(loaded)}${total ? ` / ${convertSize(total)}` : ''} (${percent}%)`,
						...(speedStr ? { speed: speedStr } : {}),
						...(etaStr ? { eta: etaStr } : {}),
					})
				},
				abortController.signal
			)

			if (!blob || blob.size === 0) {
				throw new Error('Received empty file payload from cluster')
			}

			// In-browser assembly complete: save locally via object URL trigger
			updateTask(taskId, {
				progress: 100,
				fileSize: blob.size,
				stage: 'Decryption verified. Saving file to disk...',
				speed: '',
				eta: '',
			})

			const objectUrl = URL.createObjectURL(blob)
			const a = document.createElement('a')
			a.href = objectUrl
			a.download = name
			a.style.display = 'none'
			document.body.appendChild(a)
			a.click()

			updateTask(taskId, {
				status: 'completed',
				stage: 'Downloaded & saved to disk',
				completedAt: Date.now(),
			})

			alertStore.addAlert(`Successfully downloaded & saved "${name}"`, 'success')

			setTimeout(() => {
				if (document.body.contains(a)) document.body.removeChild(a)
				URL.revokeObjectURL(objectUrl)
			}, 3000)
		} catch (err) {
			if (err.name === 'AbortError' || err.message?.includes('aborted')) {
				updateTask(taskId, {
					status: 'cancelled',
					stage: 'Download cancelled by user',
					speed: '',
					eta: '',
				})
			} else {
				console.error('In-browser download failed:', err)
				updateTask(taskId, {
					status: 'error',
					errorMessage: err.message || 'Download failed',
					stage: `Download failed: ${err.message}`,
					speed: '',
					eta: '',
				})
				alertStore.addAlert(`Failed to download "${name}": ${err.message}`, 'error')
			}
		}
	}

	const cancelUpload = (taskId) => {
		const task = tasks().find((t) => t.id === taskId)
		if (task && task.abortController) {
			task.abortController.abort()
		}
		updateTask(taskId, { status: 'cancelled', stage: 'Upload cancelled' })
	}

	const dismissTask = (taskId) => {
		setTasks((prev) => prev.filter((t) => t.id !== taskId))
	}

	const clearCompleted = () => {
		setTasks((prev) => prev.filter((t) => t.status === 'uploading' || t.status === 'downloading'))
	}

	return {
		tasks,
		activeCount,
		isMinimized,
		setIsMinimized,
		isDockOpen,
		setIsDockOpen,
		startUpload,
		startDownload,
		cancelUpload,
		dismissTask,
		clearCompleted,
	}
})

export default uploadManager
