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
			<Box sx={{ minHeight: '100vh', bgcolor: 'var(--bg-default)', color: 'var(--text-primary)' }}>
				<CssBaseline />
				<Toolbar sx={{ minHeight: '60px !important' }} />

				<Box sx={{ display: 'flex' }}>
					<SideBar />

					<Box
						component="main"
						sx={{
							flexGrow: 1,
							p: { xs: 2, sm: 3, md: 4 },
							width: '100%',
							minHeight: 'calc(100vh - 60px)',
							bgcolor: 'var(--bg-default)',
							color: 'var(--text-primary)',
							overflowX: 'hidden',
						}}
					>
						<Outlet />
					</Box>
				</Box>
			</Box>
		</Show>
	)
}

export default BasicLayout
