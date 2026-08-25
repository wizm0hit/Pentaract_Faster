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
