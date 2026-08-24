import Drawer from '@suid/material/Drawer'
import List from '@suid/material/List'
import Divider from '@suid/material/Divider'
import IconButton from '@suid/material/IconButton'
import ChevronLeftIcon from '@suid/icons-material/ChevronLeft'
import ChevronRightIcon from '@suid/icons-material/ChevronRight'
import ListItem from '@suid/material/ListItem'
import ListItemButton from '@suid/material/ListItemButton'
import Box from '@suid/material/Box'
import Typography from '@suid/material/Typography'
import { createSignal } from 'solid-js'
import StorageIcon from '@suid/icons-material/Storage'
import SmartToyIcon from '@suid/icons-material/SmartToy'
import CloudQueueIcon from '@suid/icons-material/CloudQueue'
import VpnKeyIcon from '@suid/icons-material/VpnKey'

import SideBarItem from './SideBarItem'

const initOpen = window.innerWidth > 900

const SideBar = () => {
	const [open, setOpen] = createSignal(initOpen)

	const toggleDrawerOpen = () => {
		setOpen((o) => !o)
	}

	return (
		<Drawer
			variant="permanent"
			open
			PaperProps={{
				sx: {
					width: open() ? 240 : 72,
					backgroundColor: '#0d1527',
					borderRight: '1px solid rgba(255, 255, 255, 0.08)',
					color: '#f8fafc',
					transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
					overflowX: 'hidden',
					position: 'relative',
					height: 'calc(100vh - 64px)',
				},
			}}
		>
			<Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: open() ? 'space-between' : 'center' }}>
				{open() && (
					<Typography variant="overline" sx={{ px: 1.5, color: '#64748b', fontWeight: 700, letterSpacing: '0.08em' }}>
						Vault Navigation
					</Typography>
				)}
				<IconButton
					onClick={toggleDrawerOpen}
					size="small"
					sx={{
						color: '#94a3b8',
						backgroundColor: 'rgba(255, 255, 255, 0.04)',
						'&:hover': { color: '#f8fafc', backgroundColor: 'rgba(255, 255, 255, 0.1)' },
					}}
				>
					{open() ? <ChevronLeftIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
				</IconButton>
			</Box>

			<Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.06)', mb: 1 }} />

			<List sx={{ px: 0.5 }}>
				<SideBarItem text="Storage Vaults" link="/storages" isFull={open()}>
					<StorageIcon />
				</SideBarItem>
				<SideBarItem text="Storage Workers" link="/storage_workers" isFull={open()}>
					<SmartToyIcon />
				</SideBarItem>
			</List>

			{open() && (
				<Box
					sx={{
						mt: 'auto',
						p: 2,
						m: 1.5,
						borderRadius: 2.5,
						background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
						border: '1px solid rgba(99, 102, 241, 0.2)',
					}}
				>
					<Typography variant="caption" sx={{ color: '#818cf8', fontWeight: 700, display: 'block', mb: 0.5 }}>
						AES-256-GCM
					</Typography>
					<Typography variant="caption" sx={{ color: '#94a3b8', fontSize: 11, lineHeight: 1.4, display: 'block' }}>
						All chunks encrypted with 256-bit authenticated keys before distribution.
					</Typography>
				</Box>
			)}
		</Drawer>
	)
}

export default SideBar
