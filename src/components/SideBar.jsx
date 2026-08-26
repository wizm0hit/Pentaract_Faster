import Drawer from '@suid/material/Drawer'
import List from '@suid/material/List'
import Divider from '@suid/material/Divider'
import IconButton from '@suid/material/IconButton'
import ChevronLeftIcon from '@suid/icons-material/ChevronLeft'
import ChevronRightIcon from '@suid/icons-material/ChevronRight'
import Box from '@suid/material/Box'
import Typography from '@suid/material/Typography'
import { createSignal, Show } from 'solid-js'
import StorageIcon from '@suid/icons-material/Storage'
import SmartToyIcon from '@suid/icons-material/SmartToy'
import GroupIcon from '@suid/icons-material/Group'
import SettingsIcon from '@suid/icons-material/Settings'

import SideBarItem from './SideBarItem'
import createLocalStore from '../../libs'

const initOpen = window.innerWidth > 900

const SideBar = () => {
	const [open, setOpen] = createSignal(initOpen)
	const [store] = createLocalStore()

	const toggleDrawerOpen = () => {
		setOpen((o) => !o)
	}

	const isAdmin = () => store.user?.role === 'admin'

	return (
		<Drawer
			variant="permanent"
			open
			PaperProps={{
				sx: {
					width: open() ? 230 : 68,
					backgroundColor: 'background.paper',
					borderRight: '1px solid',
					borderColor: 'divider',
					color: 'text.primary',
					transition: 'width 0.2s ease-in-out',
					overflowX: 'hidden',
					position: 'relative',
					height: 'calc(100vh - 60px)',
				},
			}}
		>
			<Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: open() ? 'space-between' : 'center' }}>
				{open() && (
					<Typography variant="overline" sx={{ px: 1, color: 'text.secondary', fontWeight: 700, letterSpacing: '0.08em', fontSize: '0.7rem' }}>
						Navigation
					</Typography>
				)}
				<IconButton
					onClick={toggleDrawerOpen}
					size="small"
					sx={{
						color: 'text.secondary',
						'&:hover': { color: 'text.primary' },
					}}
				>
					{open() ? <ChevronLeftIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
				</IconButton>
			</Box>

			<Divider sx={{ mb: 1, opacity: 0.6 }} />

			<List sx={{ px: 0.5 }}>
				<SideBarItem text="Storage Vaults" link="/storages" isFull={open()}>
					<StorageIcon />
				</SideBarItem>
				<Show when={isAdmin()}>
					<SideBarItem text="Storage Workers" link="/storage_workers" isFull={open()}>
						<SmartToyIcon />
					</SideBarItem>
					<SideBarItem text="User Accounts" link="/users" isFull={open()}>
						<GroupIcon />
					</SideBarItem>
				</Show>
				<SideBarItem text="Settings" link="/settings" isFull={open()}>
					<SettingsIcon />
				</SideBarItem>
			</List>

			{open() && (
				<Box
					sx={{
						mt: 'auto',
						p: 1.5,
						m: 1.5,
						borderRadius: '10px',
						bgcolor: 'action.hover',
						border: '1px solid',
						borderColor: 'divider',
					}}
				>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
						<Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'success.main' }} />
						<Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.75rem' }}>
							AES-256-GCM
						</Typography>
					</Box>
					<Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', lineHeight: 1.3, display: 'block' }}>
						Military-grade client chunking & Telegram vault nodes.
					</Typography>
				</Box>
			)}
		</Drawer>
	)
}

export default SideBar
