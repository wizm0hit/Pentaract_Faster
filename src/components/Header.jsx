import AppBar from '@suid/material/AppBar'
import Toolbar from '@suid/material/Toolbar'
import Typography from '@suid/material/Typography'
import IconButton from '@suid/material/IconButton'
import Button from '@suid/material/Button'
import Box from '@suid/material/Box'
import Chip from '@suid/material/Chip'
import { A, useNavigate } from '@solidjs/router'
import LogoutIcon from '@suid/icons-material/Logout'
import HelpOutlineIcon from '@suid/icons-material/HelpOutline'
import LockIcon from '@suid/icons-material/Lock'
import ShieldIcon from '@suid/icons-material/Shield'
import { createSignal } from 'solid-js'

import AppIcon from './AppIcon'
import createLocalStore from '../../libs'
import SetupGuideDialog from './SetupGuideDialog'

const Header = () => {
	const [store, setStore] = createLocalStore()
	const [guideOpen, setGuideOpen] = createSignal(false)
	const navigate = useNavigate()

	const logout = () => {
		setStore('access_token', null)
		setStore('redirect', '/')
		navigate('/login')
	}

	return (
		<>
			<AppBar
				position="fixed"
				sx={{
					background: 'rgba(11, 19, 32, 0.85)',
					backdropFilter: 'blur(12px)',
					borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
					boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
					zIndex: (theme) => theme.zIndex.drawer + 1,
				}}
			>
				<Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
					{/* Brand */}
					<A href="/storages">
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
							<Box
								sx={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									width: 38,
									height: 38,
									borderRadius: 2,
									background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
									boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
								}}
							>
								<AppIcon />
							</Box>
							<Box>
								<Typography
									variant="h6"
									noWrap
									sx={{
										fontWeight: 800,
										letterSpacing: '-0.02em',
										background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)',
										backgroundClip: 'text',
										WebkitBackgroundClip: 'text',
										WebkitTextFillColor: 'transparent',
										lineHeight: 1.1,
									}}
								>
									Pentaract Faster
								</Typography>
								<Typography
									variant="caption"
									sx={{
										fontSize: 10,
										color: '#94a3b8',
										fontWeight: 600,
										letterSpacing: '0.05em',
										textTransform: 'uppercase',
									}}
								>
									Distributed Cloud Vault
								</Typography>
							</Box>
						</Box>
					</A>

					{/* Right Actions */}
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
						{/* Encryption Badge */}
						<Chip
							icon={<ShieldIcon sx={{ fontSize: '15px !important', color: '#10b981 !important' }} />}
							label="AES-256-GCM"
							size="small"
							sx={{
								display: { xs: 'none', sm: 'inline-flex' },
								backgroundColor: 'rgba(16, 185, 129, 0.12)',
								color: '#10b981',
								fontWeight: 700,
								fontSize: 11,
								border: '1px solid rgba(16, 185, 129, 0.25)',
							}}
						/>

						{/* Setup Guide Button */}
						<Button
							variant="outlined"
							size="small"
							startIcon={<HelpOutlineIcon />}
							onClick={() => setGuideOpen(true)}
							sx={{
								color: '#e2e8f0',
								borderColor: 'rgba(255, 255, 255, 0.15)',
								backgroundColor: 'rgba(255, 255, 255, 0.04)',
								textTransform: 'none',
								fontWeight: 600,
								fontSize: 13,
								borderRadius: 2,
								px: 1.5,
								'&:hover': {
									backgroundColor: 'rgba(255, 255, 255, 0.1)',
									borderColor: 'rgba(255, 255, 255, 0.3)',
								},
							}}
						>
							Setup Guide
						</Button>

						{/* User indicator */}
						<Box
							sx={{
								display: { xs: 'none', md: 'flex' },
								alignItems: 'center',
								px: 1.5,
								py: 0.5,
								borderRadius: 2,
								backgroundColor: 'rgba(255, 255, 255, 0.05)',
								border: '1px solid rgba(255, 255, 255, 0.08)',
							}}
						>
							<Typography variant="caption" sx={{ color: '#cbd5e1', fontWeight: 500 }}>
								{store.user?.email || 'Authenticated User'}
							</Typography>
						</Box>

						{/* Logout */}
						<IconButton
							onClick={logout}
							title="Sign out"
							sx={{
								color: '#94a3b8',
								borderRadius: 2,
								backgroundColor: 'rgba(255, 255, 255, 0.04)',
								'&:hover': {
									color: '#ef4444',
									backgroundColor: 'rgba(239, 68, 68, 0.1)',
								},
							}}
						>
							<LogoutIcon sx={{ fontSize: 20 }} />
						</IconButton>
					</Box>
				</Toolbar>
			</AppBar>

			<SetupGuideDialog isOpened={guideOpen()} onClose={() => setGuideOpen(false)} />
		</>
	)
}

export default Header
