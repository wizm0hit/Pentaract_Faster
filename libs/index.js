import { createStore } from 'solid-js/store'

const getInitialStore = () => {
	const initial = {
		themeMode: 'midnight',
		accentColor: 'indigo',
		autoPreviewMedia: true,
		compactMode: false,
		chunkConcurrency: 4,
	}
	if (typeof localStorage !== 'undefined') {
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i)
			if (key) {
				const raw = localStorage.getItem(key)
				try {
					initial[key] = JSON.parse(raw)
				} catch (_) {
					initial[key] = raw
				}
			}
		}
	}
	return initial
}

const [globalStore, setGlobalStore] = createStore(getInitialStore())

function createLocalStore(prefix = null) {
	const propPrefix = prefix === null ? '' : `${prefix}.`

	const setter = (key, value) => {
		const fullKey = `${propPrefix}${String(key)}`
		setGlobalStore(fullKey, value)
		if (typeof localStorage !== 'undefined') {
			if (value === null || value === undefined) {
				localStorage.removeItem(fullKey)
			} else {
				try {
					localStorage.setItem(fullKey, JSON.stringify(value))
				} catch (_) {
					localStorage.setItem(fullKey, String(value))
				}
			}
		}
	}

	const remover = (key) => {
		const fullKey = `${propPrefix}${String(key)}`
		setGlobalStore(fullKey, undefined)
		if (typeof localStorage !== 'undefined') {
			localStorage.removeItem(fullKey)
		}
	}

	const clearer = () => {
		Object.keys(globalStore).forEach((k) => {
			if (prefix === null || k.startsWith(propPrefix)) {
				setGlobalStore(k, undefined)
				if (typeof localStorage !== 'undefined') {
					localStorage.removeItem(k)
				}
			}
		})
	}

	if (prefix === null) {
		return [globalStore, setter, remover, clearer]
	}

	const proxy = new Proxy(globalStore, {
		get(target, prop) {
			if (typeof prop === 'symbol') {
				return Reflect.get(target, prop)
			}
			if (prop === 'toJSON') {
				return () => globalStore
			}
			const fullKey = `${propPrefix}${String(prop)}`
			return target[fullKey]
		},
		set() {
			return false
		},
	})

	return [proxy, setter, remover, clearer]
}

export default createLocalStore


