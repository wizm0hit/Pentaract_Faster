import { useLocation, useNavigate } from '@solidjs/router'
import createLocalStore from '../../libs'

export function checkAuth() {
	const [store, setStore] = createLocalStore()
	const navigate = useNavigate()
	const location = useLocation()

	if (!store.access_token) {
		if (location.pathname && location.pathname !== '/login' && location.pathname !== '/register') {
			setStore('redirect', location.pathname)
		}
		navigate('/login', { replace: true })
		return false
	}
	return true
}

export function isAuthenticated() {
	const [store] = createLocalStore()
	return Boolean(store.access_token)
}

export function isAdmin() {
	const [store] = createLocalStore()
	return store.user?.role === 'admin'
}

export function checkAdmin() {
	const [store, setStore] = createLocalStore()
	const navigate = useNavigate()
	const location = useLocation()

	if (!store.access_token) {
		if (location.pathname && location.pathname !== '/login' && location.pathname !== '/register') {
			setStore('redirect', location.pathname)
		}
		navigate('/login', { replace: true })
		return false
	}

	if (store.user?.role !== 'admin') {
		navigate('/storages', { replace: true })
		return false
	}

	return true
}
