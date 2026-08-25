import createLocalStore from '../../libs'
import apiRequest, { apiMultipartRequest, apiDownloadRequest, API_BASE } from './request'
import { alertStore } from '../components/AlertStack'

/////////////////////////////////////////////////////////////
////  ADMIN & USERS
/////////////////////////////////////////////////////////////

/**
 * @typedef {Object} AdminUser
 * @property {string} id
 * @property {string} email
 * @property {'admin' | 'user'} role
 * @property {string} createdAt
 * @property {string} [createdBy]
 */

/**
 * @returns {Promise<{ users: AdminUser[] }>}
 */
const listAdminUsers = async () => {
	return await apiRequest('/admin/users', 'get', getAuthToken())
}

/**
 * @param {string} email
 * @param {string} password
 * @param {'admin' | 'user'} role
 * @returns {Promise<any>}
 */
const createAdminUser = async (email, password, role = 'user') => {
	return await apiRequest('/admin/users', 'post', getAuthToken(), {
		email,
		password,
		role,
	})
}

/**
 * @param {string} id
 * @param {string} newPassword
 * @returns {Promise<any>}
 */
const resetUserPassword = async (id, newPassword) => {
	return await apiRequest(`/admin/users/${id}/password`, 'patch', getAuthToken(), {
		newPassword,
	})
}

/**
 * @param {string} id
 * @returns {Promise<any>}
 */
const deleteAdminUser = async (id) => {
	return await apiRequest(`/admin/users/${id}`, 'delete', getAuthToken())
}

/////////////////////////////////////////////////////////////
////  AUTH
/////////////////////////////////////////////////////////////

/**
 * @typedef {Object} TokenData
 * @property {string} access_token
 * @property {{ id: string, email: string, role: string }} [user]
 */

/**
 * @param {string} email
 * @param {string} password
 * @returns {Promise<TokenData>}
 */
const login = async (email, password) => {
	return await apiRequest('/auth/login', 'post', undefined, {
		email,
		password,
	})
}

/**
 * @returns {Promise<{ user: { id: string, email: string, role: string } }>}
 */
const getMe = async () => {
	return await apiRequest('/auth/me', 'get', getAuthToken())
}

/////////////////////////////////////////////////////////////
////  STORAGES
/////////////////////////////////////////////////////////////

/**
 * @param {string} name
 * @param {number} chat_id
 * @returns
 */
const createStorage = async (name, chat_id) => {
	return await apiRequest('/storages', 'post', getAuthToken(), {
		name,
		chat_id,
	})
}

/**
 * @typedef {Object} Storage
 * @property {string} id
 * @property {string} name
 * @property {number} chat_id
 */

/**
 * @typedef {Object} StorageWithInfoProperties
 * @property {number} size
 * @property {number} files_amount
 * @property {number} [chunks_count]
 * @property {number} [workers_count]
 * @property {string} [encryption_standard]
 * @typedef {Storage & StorageWithInfoProperties} StorageWithInfo
 */

/**
 * @typedef {Object} StoragesSchema
 * @property {StorageWithInfo[]} storages
 */

/**
 * @returns {Promise<StoragesSchema>}
 */
const listStorages = async () => {
	return await apiRequest('/storages', 'get', getAuthToken())
}

/**
 * @param {string} id
 * @returns {Promise<Storage>}
 */
const getStorage = async (id) => {
	return await apiRequest(`/storages/${id}`, 'get', getAuthToken())
}

/**
 * @param {string} id
 * @returns {Promise<void>}
 */
const deleteStorage = async (id) => {
	return await apiRequest(`/storages/${id}`, 'delete', getAuthToken())
}

/////////////////////////////////////////////////////////////
////  ACCESS
/////////////////////////////////////////////////////////////

/**
 * @typedef {'R' | 'W' | 'A'} AccessType
 */

/**
 * @typedef {Object} UserWithAccess
 * @property {string} id
 * @property {string} email
 * @property {AccessType} access_type
 */

/**
 * @param {string} storageID
 * @param {string} email
 * @param {AccessType} accessType
 * @returns
 */
const grantAccess = async (storageID, email, accessType) => {
	return await apiRequest(
		`/storages/${storageID}/access`,
		'post',
		getAuthToken(),
		{ user_email: email, access_type: accessType }
	)
}

/**
 * @param {string} storageID
 * @returns {Promise<UserWithAccess[]>}
 */
const listUsersWithAccess = async (storageID) => {
	return await apiRequest(
		`/storages/${storageID}/access`,
		'get',
		getAuthToken()
	)
}

/**
 * @param {string} storageID
 * @param {string} userID
 * @returns
 */
const restrictAccess = async (storageID, userID) => {
	return await apiRequest(
		`/storages/${storageID}/access`,
		'delete',
		getAuthToken(),
		{ user_id: userID }
	)
}

/////////////////////////////////////////////////////////////
////  STORAGE WORKERS
/////////////////////////////////////////////////////////////

/**
 * @typedef {Object} StorageWorker
 * @property {string} id
 * @property {string} name
 * @property {string | null} storage_id
 * @property {string} token
 * @property {'active' | 'idle'} [status]
 * @property {string} [lastPing]
 */

/**
 * @param {string} name
 * @param {string} token
 * @param {string | null | undefined} storage_id
 * @returns {Promise<StorageWorker>}
 */
const createStorageWorker = async (name, token, storage_id) => {
	return await apiRequest('/storage_workers', 'post', getAuthToken(), {
		name,
		token,
		storage_id,
	})
}

/**
 * @returns {Promise<StorageWorker[]>}
 */
const listStorageWorkers = async () => {
	return await apiRequest('/storage_workers', 'get', getAuthToken())
}

/**
 * @param {string} id
 * @returns {Promise<void>}
 */
const deleteStorageWorker = async (id) => {
	return await apiRequest(`/storage_workers/${id}`, 'delete', getAuthToken())
}

/**
 * @param {string} token
 * @returns {Promise<{ valid: boolean, bot?: any, error?: string }>}
 */
const testTelegramBot = async (token) => {
	return await apiRequest('/telegram/test-bot', 'post', getAuthToken(), { token })
}

/////////////////////////////////////////////////////////////
////  FILES
/////////////////////////////////////////////////////////////

/**
 * @param {string} storage_id
 * @param {string} path
 * @param {string} folderName
 * @returns
 */
const createFolder = async (storage_id, path, folderName) => {
	return await apiRequest(
		`/storages/${storage_id}/files/create_folder`,
		'post',
		getAuthToken(),
		{ path, folder_name: folderName }
	)
}

/**
 * @param {string} storage_id
 * @param {Object} chunkData
 * @param {Blob} chunkData.chunk
 * @param {number} chunkData.chunk_index
 * @param {number} chunkData.total_chunks
 * @param {string} chunkData.path
 * @param {string} chunkData.file_name
 * @param {number} chunkData.total_size
 * @param {string} chunkData.mime_type
 * @param {(progress: number) => void} onProgress
 * @returns {Promise<any>}
 */
const uploadChunk = async (storage_id, chunkData, onProgress = null, silent = true) => {
	const form = new FormData()
	form.append('chunk', chunkData.chunk, `${chunkData.file_name}.part_${chunkData.chunk_index}`)
	form.append('chunk_index', String(chunkData.chunk_index))
	form.append('total_chunks', String(chunkData.total_chunks))
	form.append('path', chunkData.path || '')
	form.append('file_name', chunkData.file_name)
	form.append('total_size', String(chunkData.total_size))
	form.append('mime_type', chunkData.mime_type || 'application/octet-stream')

	return await apiMultipartRequest(
		`/storages/${storage_id}/files/upload_chunk`,
		getAuthToken(),
		form,
		onProgress,
		silent
	)
}

/**
 * @param {string} storage_id
 * @param {string} path
 * @param {any} file
 * @param {(progress: number) => void} onProgress
 * @returns
 */
const uploadFile = async (storage_id, path, file, onProgress = null) => {
	const form = new FormData()
	form.append('file', file)
	form.append('path', path)

	return await apiMultipartRequest(
		`/storages/${storage_id}/files/upload`,
		getAuthToken(),
		form,
		onProgress
	)
}

/**
 * @param {string} storage_id
 * @param {string} path
 * @param {any} file
 * @param {(progress: number) => void} onProgress
 * @returns
 */
const uploadFileTo = async (storage_id, path, file, onProgress = null) => {
	const form = new FormData()
	form.append('file', file)
	form.append('path', path)

	return await apiMultipartRequest(
		`/storages/${storage_id}/files/upload_to`,
		getAuthToken(),
		form,
		onProgress
	)
}

/**
 * @typedef {Object} FSElement
 * @property {string} path
 * @property {string} name
 * @property {boolean} is_file
 * @property {number} size
 * @property {number} [chunks_count]
 * @property {string} [encryption_algorithm]
 */

/**
 * @param {string} storage_id
 * @param {string} path
 * @returns {Promise<FSElement[]>}
 */
const getFSLayer = async (storage_id, path) => {
	const encodedPath = path ? encodePath(path) : ''
	const url = encodedPath
		? `/storages/${storage_id}/files/tree/${encodedPath}`
		: `/storages/${storage_id}/files/tree/`
	return await apiRequest(url, 'get', getAuthToken())
}

/**
 * @param {string} storage_id
 * @param {string} path
 * @returns {Promise<any>}
 */
const getFileInfo = async (storage_id, path) => {
	const encodedPath = encodePath(path)
	const url = `/storages/${storage_id}/files/info/${encodedPath}`
	return await apiRequest(url, 'get', getAuthToken())
}

/**
 * Encodes a file path for URL by encoding each segment separately
 * @param {string} path
 * @returns {string}
 */
const encodePath = (path) => {
	if (!path) return ''
	return path.split('/').map(encodeURIComponent).join('/')
}

/**
 * Generates a direct streaming download URL for native browser download
 * @param {string} storage_id
 * @param {string} path
 * @param {string} [token]
 * @returns {string}
 */
const getDownloadUrl = (storage_id, path, token = null) => {
	const encodedPath = encodePath(path)
	const rawToken = token || getRawAuthToken() || ''
	return `${API_BASE}/storages/${storage_id}/files/download/${encodedPath}?token=${encodeURIComponent(rawToken)}`
}

/**
 * @param {string} storage_id
 * @param {string} path
 * @param {(progress: number, loaded?: number, total?: number) => void} [onProgress]
 * @param {AbortSignal} [signal]
 * @returns {Promise<Blob>}
 */
const download = async (storage_id, path, onProgress = null, signal = null) => {
	const encodedPath = encodePath(path)
	const rawToken = getRawAuthToken() || ''
	const url = `/storages/${storage_id}/files/download/${encodedPath}?token=${encodeURIComponent(rawToken)}`
	const auth_token = getAuthToken()

	return await apiDownloadRequest(url, auth_token, onProgress, signal)
}

/**
 * @param {string} storage_id
 * @param {string} path
 */
const deleteFile = async (storage_id, path) => {
	const encodedPath = encodePath(path)
	await apiRequest(
		`/storages/${storage_id}/files/${encodedPath}`,
		'delete',
		getAuthToken()
	)
}

function getRawAuthToken() {
	const [store] = createLocalStore()
	if (store && store.access_token) {
		return store.access_token
	}
	return ''
}

function getAuthToken() {
	const token = getRawAuthToken()
	if (token) {
		return `Bearer ${token}`
	}
	return null
}

/////////////////////////////////////////////////////////////
////  API Export
/////////////////////////////////////////////////////////////

const API = {
	admin: {
		listUsers: listAdminUsers,
		createUser: createAdminUser,
		resetPassword: resetUserPassword,
		deleteUser: deleteAdminUser,
	},
	auth: {
		login,
		me: getMe,
		getToken: getRawAuthToken,
	},
	storages: {
		createStorage,
		listStorages,
		getStorage,
		deleteStorage,
	},
	access: {
		grantAccess,
		listUsersWithAccess,
		restrictAccess,
	},
	storageWorkers: {
		createStorageWorker,
		listStorageWorkers,
		deleteStorageWorker,
	},
	telegram: {
		testTelegramBot,
	},
	files: {
		createFolder,
		uploadChunk,
		uploadFile,
		uploadFileTo,
		getFSLayer,
		getFileInfo,
		download,
		getDownloadUrl,
		deleteFile,
	},
}

export default API
