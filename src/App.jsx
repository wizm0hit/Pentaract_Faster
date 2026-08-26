import { createMemo, createEffect } from 'solid-js'
import { Routes, Route, Navigate } from '@solidjs/router'
import { ThemeProvider, createTheme } from '@suid/material'

import Login from './pages/Login'
import BasicLayout from './layouts/Basic'
import Storages from './pages/Storages'
import StorageCreateForm from './pages/Storages/StorageCreateForm'
import AlertStack from './components/AlertStack'
import GlobalUploadDock from './components/GlobalUploadDock'
import StorageWorkers from './pages/StorageWorkers'
import StorageWorkerCreateForm from './pages/StorageWorkers/StorageWorkerCreateForm'
import Files from './pages/Files'
import UploadFileTo from './pages/Files/UploadFileTo'
import UsersPage from './pages/Users'
import Settings from './pages/Settings'
import NotFound from './pages/404'
import createLocalStore from '../libs'

const ACCENT_MAP = {
	indigo: { main: '#6366f1', secondary: '#38bdf8' },
	sky: { main: '#0ea5e9', secondary: '#38bdf8' },
	emerald: { main: '#10b981', secondary: '#34d399' },
	violet: { main: '#8b5cf6', secondary: '#c084fc' },
	amber: { main: '#f59e0b', secondary: '#fbbf24' },
}

const THEME_PALETTES = {
	midnight: {
		mode: 'dark',
		background: {
			default: '#0b0f19',
			paper: '#111827',
		},
		text: {
			primary: '#f8fafc',
			secondary: '#94a3b8',
		},
		divider: 'rgba(255, 255, 255, 0.08)',
	},
	cyber: {
		mode: 'dark',
		background: {
			default: '#080e1a',
			paper: '#0d1527',
		},
		text: {
			primary: '#f8fafc',
			secondary: '#94a3b8',
		},
		divider: 'rgba(56, 189, 248, 0.12)',
	},
	monochrome: {
		mode: 'dark',
		background: {
			default: '#121212',
			paper: '#1e1e1e',
		},
		text: {
			primary: '#ffffff',
			secondary: '#a3a3a3',
		},
		divider: 'rgba(255, 255, 255, 0.1)',
	},
	light: {
		mode: 'light',
		background: {
			default: '#f8fafc',
			paper: '#ffffff',
		},
		text: {
			primary: '#0f172a',
			secondary: '#64748b',
		},
		divider: 'rgba(0, 0, 0, 0.08)',
	},
}

const App = () => {
	const [store] = createLocalStore()

	const currentTheme = createMemo(() => {
		const mode = store.themeMode || 'midnight'
		const accent = store.accentColor || 'indigo'
		const basePalette = THEME_PALETTES[mode] || THEME_PALETTES.midnight
		const accentPalette = ACCENT_MAP[accent] || ACCENT_MAP.indigo

		return createTheme({
			palette: {
				...basePalette,
				primary: {
					main: accentPalette.main,
				},
				secondary: {
					main: accentPalette.secondary,
				},
			},
			shape: {
				borderRadius: 8,
			},
			typography: {
				fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
			},
		})
	})

	createEffect(() => {
		const mode = store.themeMode || 'midnight'
		const accent = store.accentColor || 'indigo'
		const basePalette = THEME_PALETTES[mode] || THEME_PALETTES.midnight
		const accentPalette = ACCENT_MAP[accent] || ACCENT_MAP.indigo

		if (typeof document !== 'undefined') {
			document.documentElement.setAttribute('data-theme', mode)
			document.documentElement.setAttribute('data-accent', accent)
			document.documentElement.style.setProperty('--bg-default', basePalette.background.default)
			document.documentElement.style.setProperty('--bg-paper', basePalette.background.paper)
			document.documentElement.style.setProperty('--text-primary', basePalette.text.primary)
			document.documentElement.style.setProperty('--text-secondary', basePalette.text.secondary)
			document.documentElement.style.setProperty('--border-divider', basePalette.divider)
			document.documentElement.style.setProperty('--primary-main', accentPalette.main)
			document.documentElement.style.setProperty('--primary-hover', accentPalette.main)
			document.documentElement.style.setProperty('--secondary-main', accentPalette.secondary)
			document.documentElement.style.setProperty('--action-selected', `${accentPalette.main}25`)
			document.body.style.backgroundColor = basePalette.background.default
			document.body.style.color = basePalette.text.primary
		}
	})

	return (
		<ThemeProvider theme={currentTheme()}>
			<Routes>
				<Route path="/login" component={Login} />
				<Route path="/register" element={<Navigate href="/login" />} />

				<Route path="/" component={BasicLayout}>
					<Route path="/" element={<Navigate href="/storages" />} />
					<Route path="/storages" component={Storages} />
					<Route path="/storages/register" component={StorageCreateForm} />
					<Route path="/storages/:id/files/*path" component={Files} />
					<Route path="/storages/:id/upload_to" component={UploadFileTo} />
					<Route path="/storage_workers" component={StorageWorkers} />
					<Route
						path="/storage_workers/register"
						component={StorageWorkerCreateForm}
					/>
					<Route path="/users" component={UsersPage} />
					<Route path="/settings" component={Settings} />
					<Route path="*404" component={NotFound} />
				</Route>
			</Routes>

			<AlertStack />
			<GlobalUploadDock />
		</ThemeProvider>
	)
}

export default App
