import { alertStore } from '../components/AlertStack'

export const API_BASE = import.meta.env.VITE_API_BASE || '/api'

/**
 * @typedef {'get' | 'post' | 'patch' | 'delete'} Method
 */

/**
 *
 * @param {string} path
 * @param {Method} method
 * @param {string | null | undefined} auth_token
 * @param {any} body
 * @param {boolean} return_response
 * @returns
 */
const apiRequest = async (
	path,
	method,
	auth_token,
	body,
	return_response = false
) => {
	const { addAlert } = alertStore

	const fullpath = `${API_BASE}${path}`

	const headers = new Headers()
	headers.append('Content-Type', 'application/json')
	if (auth_token) {
		headers.append('Authorization', auth_token)
	}

	try {
		const response = await fetch(fullpath, {
			method,
			body: JSON.stringify(body),
			headers,
		})

		if (!response.ok) {
			const text = await response.text()
			let errMsg = text
			try {
				const json = JSON.parse(text)
				if (json.error) errMsg = json.error
				else if (json.message) errMsg = json.message
			} catch {}

			// Handle session expiry or missing auth
			if (response.status === 401) {
				if (!path.includes('/auth/login')) {
					try {
						const raw = localStorage.getItem('local_store')
						if (raw) {
							const parsed = JSON.parse(raw)
							delete parsed.access_token
							localStorage.setItem('local_store', JSON.stringify(parsed))
						}
					} catch {}
					if (window.location.pathname !== '/login') {
						window.location.href = '/login'
					}
				}
			}

			const err = new Error(errMsg || `Request failed with status ${response.status}`)
			err.status = response.status
			throw err
		}

		if (return_response) {
			return response
		}

		try {
			return await response.json()
		} catch {}
	} catch (err) {
		// Only show toast alert if not a login attempt (which is handled inline)
		if (!path.includes('/auth/login') && err.status !== 401) {
			addAlert(err.message, 'error')
		}

		throw err
	}
}

/**
 *
 * @param {string} path
 * @param {string | null | undefined} auth_token
 * @param {FormData} form
 * @param {(progress: number) => void} onProgress
 * @param {boolean} silent
 * @returns
 */
export const apiMultipartRequest = async (
	path,
	auth_token,
	form,
	onProgress = null,
	silent = false
) => {
	const { addAlert } = alertStore

	const fullpath = `${API_BASE}${path}`

	const headers = new Headers()
	if (auth_token) {
		headers.append('Authorization', auth_token)
	}

	try {
		// Use XMLHttpRequest for progress tracking and timeout control
		if (onProgress) {
			return new Promise((resolve, reject) => {
				const xhr = new XMLHttpRequest()
				xhr.timeout = 90000 // 90 second timeout per chunk

				xhr.upload.addEventListener('progress', (e) => {
					if (e.lengthComputable) {
						const percentComplete = (e.loaded / e.total) * 100
						onProgress(percentComplete)
					}
				})

				xhr.addEventListener('load', () => {
					if (xhr.status >= 200 && xhr.status < 300) {
						try {
							const response = xhr.responseText
							if (response) {
								resolve(JSON.parse(response))
							} else {
								resolve(null)
							}
						} catch {
							resolve(null)
						}
					} else {
						const error = new Error(xhr.responseText || `Upload failed with HTTP ${xhr.status}`)
						if (!silent) addAlert(error.message, 'error')
						reject(error)
					}
				})

				xhr.addEventListener('error', () => {
					const error = new Error('Network connection error')
					if (!silent) addAlert(error.message, 'error')
					reject(error)
				})

				xhr.addEventListener('timeout', () => {
					const error = new Error('Chunk upload timed out after 90s')
					if (!silent) addAlert(error.message, 'error')
					reject(error)
				})

				xhr.open('POST', fullpath)
				if (auth_token) {
					xhr.setRequestHeader('Authorization', auth_token)
				}
				xhr.send(form)
			})
		}

		// Fallback to fetch if no progress callback
		const response = await fetch(fullpath, {
			method: 'post',
			body: form,
			headers,
		})

		if (!response.ok) {
			throw new Error(await response.text())
		}

		try {
			return await response.json()
		} catch {}
	} catch (err) {
		if (!silent) addAlert(err.message, 'error')

		throw err
	}
}

/**
 *
 * @param {string} path
 * @param {string | null | undefined} auth_token
 * @param {(progress: number) => void} onProgress
 * @returns {Promise<Blob>}
 */
export const apiDownloadRequest = async (
	path,
	auth_token,
	onProgress = null,
	signal = null
) => {
	const fullpath = `${API_BASE}${path}`

	try {
		const headers = new Headers()
		if (auth_token) {
			headers.append('Authorization', auth_token)
		}

		const response = await fetch(fullpath, {
			method: 'GET',
			headers,
			signal,
		})

		if (!response.ok) {
			let errorMsg = `Download failed (HTTP ${response.status})`
			try {
				const errorJson = await response.json()
				if (errorJson && errorJson.error) {
					errorMsg = errorJson.error
				}
			} catch (_) {
				try {
					const text = await response.text()
					if (text) errorMsg = text
				} catch (_) {}
			}
			throw new Error(errorMsg)
		}

		const contentLengthHeader = response.headers.get('content-length')
		const totalBytes = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0
		const contentType = response.headers.get('content-type') || 'application/octet-stream'

		// Stream reading with live progress
		if (response.body && typeof response.body.getReader === 'function') {
			const reader = response.body.getReader()
			const chunks = []
			let receivedBytes = 0

			while (true) {
				const { done, value } = await reader.read()
				if (done) break

				if (value && value.length > 0) {
					chunks.push(value)
					receivedBytes += value.length

					if (onProgress) {
						const percent = totalBytes > 0 ? Math.min(100, Math.round((receivedBytes / totalBytes) * 100)) : 0
						onProgress(percent, receivedBytes, totalBytes)
					}
				}
			}

			if (receivedBytes === 0) {
				throw new Error('Empty file received from cluster')
			}

			return new Blob(chunks, { type: contentType })
		}

		// Fallback for browsers without stream readers
		const blob = await response.blob()
		if (!blob || blob.size === 0) {
			throw new Error('Empty file received from cluster')
		}
		if (onProgress) onProgress(100, blob.size, blob.size)
		return blob
	} catch (err) {
		throw err
	}
}

export default apiRequest
