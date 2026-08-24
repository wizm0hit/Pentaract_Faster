import { alertStore } from '../components/AlertStack'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

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
			throw new Error(await response.text())
		}

		if (return_response) {
			return response
		}

		try {
			return await response.json()
		} catch {}
	} catch (err) {
		addAlert(err.message, 'error')

		throw err
	}
}

/**
 *
 * @param {string} path
 * @param {string | null | undefined} auth_token
 * @param {FormData} form
 * @param {(progress: number) => void} onProgress
 * @returns
 */
export const apiMultipartRequest = async (
	path,
	auth_token,
	form,
	onProgress = null
) => {
	const { addAlert } = alertStore

	const fullpath = `${API_BASE}${path}`

	const headers = new Headers()
	// headers.append("Content-Type", "multipart/form-data");
	if (auth_token) {
		headers.append('Authorization', auth_token)
	}

	try {
		// Use XMLHttpRequest for progress tracking
		if (onProgress) {
			return new Promise((resolve, reject) => {
				const xhr = new XMLHttpRequest()

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
						const error = new Error(xhr.responseText || 'Upload failed')
						addAlert(error.message, 'error')
						reject(error)
					}
				})

				xhr.addEventListener('error', () => {
					const error = new Error('Network error')
					addAlert(error.message, 'error')
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
		addAlert(err.message, 'error')

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
	onProgress = null
) => {
	const { addAlert } = alertStore

	const fullpath = `${API_BASE}${path}`

	try {
		// Use XMLHttpRequest for progress tracking
		if (onProgress) {
			return new Promise((resolve, reject) => {
				const xhr = new XMLHttpRequest()
				xhr.responseType = 'blob'

				// Track download progress (response, not upload)
				xhr.addEventListener('progress', (e) => {
					if (e.lengthComputable) {
						const percentComplete = (e.loaded / e.total) * 100
						onProgress(percentComplete)
					}
				})

				xhr.addEventListener('load', () => {
					if (xhr.status >= 200 && xhr.status < 300) {
						const blob = xhr.response
						if (!blob || blob.size === 0) {
							const error = new Error('Download failed: Empty file received')
							addAlert(error.message, 'error')
							reject(error)
							return
						}
						resolve(blob)
					} else {
						const error = new Error(xhr.responseText || 'Download failed')
						addAlert(error.message, 'error')
						reject(error)
					}
				})

				xhr.addEventListener('error', () => {
					const error = new Error('Network error')
					addAlert(error.message, 'error')
					reject(error)
				})

				xhr.open('GET', fullpath)
				if (auth_token) {
					xhr.setRequestHeader('Authorization', auth_token)
				}
				xhr.send()
			})
		}

		// Fallback to fetch if no progress callback
		const headers = new Headers()
		if (auth_token) {
			headers.append('Authorization', auth_token)
		}

		const response = await fetch(fullpath, {
			method: 'get',
			headers,
		})

		if (!response.ok) {
			throw new Error(await response.text())
		}

		const blob = await response.blob()
		if (!blob || blob.size === 0) {
			throw new Error('Download failed: Empty file received')
		}

		return blob
	} catch (err) {
		addAlert(err.message, 'error')
		throw err
	}
}

export default apiRequest
