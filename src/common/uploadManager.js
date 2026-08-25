import { createRoot, createSignal } from 'solid-js'
import API from '../api'
import { alertStore } from '../components/AlertStack'

const CHUNK_SIZE = 5 * 1024 * 1024 // 5 MB per slice

/**
 * @typedef {Object} UploadTask
 * @property {string} id
 * @property {string} storageId
 * @property {string} fileName
 * @property {number} fileSize
 * @property {string} targetPath
 * @property {number} progress // 0 to 100
 * @property {number} currentChunk
 * @property {number} totalChunks
 * @property {string} stage
 * @property {'uploading' | 'completed' | 'error' | 'cancelled'} status
 * @property {string} [errorMessage]
 * @property {string[]} workerNames
 * @property {number[]} telegramMessageIds
 * @property {number} startedAt
 * @property {number} [completedAt]
 * @property {AbortController} [abortController]
 */

export const uploadManager = createRoot(() => {
	const [tasks, setTasks] = createSignal([])
	const [isMinimized, setIsMinimized] = createSignal(false)
	const [isDockOpen, setIsDockOpen] = createSignal(false)

	const activeCount = () => tasks().filter((t) => t.status === 'uploading').length

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

	const startUpload = async (storageId, targetPath, file) => {
		if (!file) return

		const taskId = 'up_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now()
		const totalChunks = Math.ceil(file.size / CHUNK_SIZE) || 1
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
				? `Slicing into ${totalChunks} chunks & connecting to Telegram...`
				: 'Encrypting with AES-256-GCM & streaming to Telegram...',
			status: 'uploading',
			workerNames: [],
			telegramMessageIds: [],
			startedAt: Date.now(),
			abortController,
		}

		setTasks((prev) => [initialTask, ...prev])
		setIsDockOpen(true)
		setIsMinimized(false)

		try {
			// Stream chunk-by-chunk directly to Telegram group
			for (let i = 0; i < totalChunks; i++) {
				if (abortController.signal.aborted) {
					throw new Error('Upload cancelled by user')
				}

				const start = i * CHUNK_SIZE
				const end = Math.min(start + CHUNK_SIZE, file.size)
				const chunkBlob = file.slice(start, end)

				updateTask(taskId, (t) => ({
					...t,
					currentChunk: i + 1,
					stage: `Direct streaming chunk ${i + 1}/${totalChunks} to Telegram group...`,
				}))

				const response = await API.files.uploadChunk(
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
						const overall = Math.round(((i + (chunkPct / 100)) / totalChunks) * 100)
						updateTask(taskId, { progress: Math.min(99, overall) })
					}
				)

				const workerName = response?.worker_name || 'Telegram Worker'
				const tgMsgId = response?.telegram_message_id

				updateTask(taskId, (t) => {
					const updatedWorkers = t.workerNames.includes(workerName) ? t.workerNames : [...t.workerNames, workerName]
					const updatedTgIds = tgMsgId ? [...t.telegramMessageIds, tgMsgId] : t.telegramMessageIds
					const newProgress = Math.round(((i + 1) / totalChunks) * 100)

					return {
						...t,
						progress: newProgress,
						workerNames: updatedWorkers,
						telegramMessageIds: updatedTgIds,
						stage: i + 1 === totalChunks
							? 'Uploaded all chunks directly to Telegram group!'
							: `Chunk ${i + 1}/${totalChunks} posted to Telegram (${workerName})`,
					}
				})
			}

			// Finalize completion
			updateTask(taskId, {
				status: 'completed',
				progress: 100,
				completedAt: Date.now(),
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
				})
			} else {
				console.error('Direct Telegram upload failed:', err)
				updateTask(taskId, {
					status: 'error',
					errorMessage: err.message || 'Direct upload to Telegram failed',
					stage: `Upload failed: ${err.message || 'Network error'}`,
				})
				alertStore.addAlert(`Failed to upload "${file.name}": ${err.message}`, 'error')
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
		setTasks((prev) => prev.filter((t) => t.status === 'uploading'))
	}

	return {
		tasks,
		activeCount,
		isMinimized,
		setIsMinimized,
		isDockOpen,
		setIsDockOpen,
		startUpload,
		cancelUpload,
		dismissTask,
		clearCompleted,
	}
})

export default uploadManager
