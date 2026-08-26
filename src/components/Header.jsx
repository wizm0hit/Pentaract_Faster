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
import ShieldOutlinedIcon from '@suid/icons-material/ShieldOutlined'
import SettingsOutlinedIcon from '@suid/icons-material/SettingsOutlined'
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
					bgcolor: 'background.paper',
					color: 'text.primary',
					borderBottom: '1px solid',
					borderColor: 'divider',
					boxShadow: 'none',
					zIndex: (theme) => theme.zIndex.drawer + 1,
				}}
			>
				<Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 }, minHeight: '60px !important' }}>
					{/* Brand */}
					<A href="/storages" style={{ 'text-decoration': 'none', color: 'inherit' }}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
							<Box
								sx={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									width: 34,
									height: 34,
									borderRadius: '8px',
									bgcolor: 'primary.main',
									color: '#ffffff',
								}}
							>
								<AppIcon />
							</Box>
							<Box>
								<Typography
									variant="subtitle1"
									noWrap
									sx={{
										fontWeight: 700,
										letterSpacing: '-0.02em',
										color: 'text.primary',
										lineHeight: 1.2,
									}}
								>
									Pentaract
								</Typography>
							</Box>
						</Box>
					</A>

					{/* Right Actions */}
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						{/* Encryption Badge */}
						<Chip
							icon={<ShieldOutlinedIcon sx={{ fontSize: '14px !important', color: 'success.main !important' }} />}
							label="AES-256-GCM"
							size="small"
							sx={{
								display: { xs: 'none', sm: 'inline-flex' },
								bgcolor: 'action.hover',
								color: 'text.secondary',
								fontWeight: 600,
								fontSize: '0.72rem',
								border: '1px solid',
								borderColor: 'divider',
								height: '24px',
							}}
						/>

						{/* Setup Guide Button */}
						<Button
							variant="text"
							size="small"
							startIcon={<HelpOutlineIcon sx={{ fontSize: '17px !important' }} />}
							onClick={() => setGuideOpen(true)}
							sx={{
								color: 'text.secondary',
								textTransform: 'none',
								fontWeight: 500,
								fontSize: '0.82rem',
								borderRadius: '6px',
								px: 1.2,
								'&:hover': {
									color: 'text.primary',
									bgcolor: 'action.hover',
								},
							}}
						>
							Guide
						</Button>

						{/* User indicator */}
						<Box
							sx={{
								display: { xs: 'none', md: 'flex' },
								alignItems: 'center',
								gap: 1,
								px: 1.2,
								py: 0.4,
								borderRadius: '6px',
								bgcolor: 'action.hover',
								border: '1px solid',
								borderColor: 'divider',
							}}
						>
							<Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600 }}>
								{store.user?.email || 'User'}
							</Typography>
							{store.user?.role && (
								<Chip
									label={store.user.role === 'admin' ? 'Admin' : 'Member'}
									size="small"
									color={store.user.role === 'admin' ? 'secondary' : 'default'}
									sx={{
										height: '18px',
										fontSize: '0.68rem',
										fontWeight: 700,
									}}
								/>
							)}
						</Box>

						{/* Settings Shortcut */}
						<IconButton
							onClick={() => navigate('/settings')}
							title="Settings & Themes"
							size="small"
							sx={{
								color: 'text.secondary',
								borderRadius: '6px',
								'&:hover': {
									color: 'text.primary',
									bgcolor: 'action.hover',
								},
							}}
						>
							<SettingsOutlinedIcon sx={{ fontSize: 20 }} />
						</IconButton>

						{/* Logout */}
						<IconButton
							onClick={logout}
							title="Sign out"
							size="small"
							sx={{
								color: 'text.secondary',
								borderRadius: '6px',
								'&:hover': {
									color: 'error.main',
									bgcolor: 'action.hover',
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
