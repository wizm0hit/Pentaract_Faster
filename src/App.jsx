import { Routes, Route, Navigate } from '@solidjs/router'
import { ThemeProvider, createTheme } from '@suid/material'

import Login from './pages/Login'
import BasicLayout from './layouts/Basic'
import Storages from './pages/Storages'
import StorageCreateForm from './pages/Storages/StorageCreateForm'
import AlertStack from './components/AlertStack'
import StorageWorkers from './pages/StorageWorkers'
import StorageWorkerCreateForm from './pages/StorageWorkers/StorageWorkerCreateForm'
import Files from './pages/Files'
import UploadFileTo from './pages/Files/UploadFileTo'
import Register from './pages/Register'
import NotFound from './pages/404'

const theme = createTheme({
	palette: {
		mode: 'dark',
		primary: {
			main: '#6366f1',
		},
		secondary: {
			main: '#38bdf8',
		},
		background: {
			default: '#080e1a',
			paper: '#0d1527',
		},
		text: {
			primary: '#f8fafc',
			secondary: '#94a3b8',
		},
	},
})

const App = () => {
	return (
		<ThemeProvider theme={theme}>
			<Routes>
				<Route path="/login" component={Login} />
				<Route path="/register" component={Register} />

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
					<Route path="*404" component={NotFound} />
				</Route>
			</Routes>

			<AlertStack />
		</ThemeProvider>
	)
}

export default App
