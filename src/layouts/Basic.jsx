import { createEffect, Show } from 'solid-js'
import { Outlet, useNavigate, useLocation } from '@solidjs/router'
import Header from '../components/Header'
import SideBar from '../components/SideBar'
import Box from '@suid/material/Box'
import Container from '@suid/material/Container'
import CssBaseline from '@suid/material/CssBaseline'
import Toolbar from '@suid/material/Toolbar'

import createLocalStore from '../../libs'

const BasicLayout = () => {
	const [store, setStore] = createLocalStore()
	const navigate = useNavigate()
	const location = useLocation()

	createEffect(() => {
		if (!store.access_token) {
			if (location.pathname && location.pathname !== '/login' && location.pathname !== '/register') {
				setStore('redirect', location.pathname)
			}
			navigate('/login', { replace: true })
		}
	})

	return (
		<Show when={Boolean(store.access_token)}>
			<Header />
			<Box>
				<CssBaseline />
				<Toolbar />

				<Box sx={{ display: 'flex' }}>
					<SideBar />

					<Container sx={{ pt: 4 }}>
						<Outlet />
					</Container>
				</Box>
			</Box>
		</Show>
	)
}

export default BasicLayout
