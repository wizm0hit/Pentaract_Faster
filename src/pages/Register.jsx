import Box from '@suid/material/Box'
import Button from '@suid/material/Button'
import Paper from '@suid/material/Paper'
import Typography from '@suid/material/Typography'
import Divider from '@suid/material/Divider'
import Chip from '@suid/material/Chip'
import ShieldIcon from '@suid/icons-material/Shield'
import LockIcon from '@suid/icons-material/Lock'
import AdminPanelSettingsIcon from '@suid/icons-material/AdminPanelSettings'
import ArrowBackIcon from '@suid/icons-material/ArrowBack'
import { A, useNavigate } from '@solidjs/router'

import AppIcon from '../components/AppIcon'

const Register = () => {
	const navigate = useNavigate()

	return (
		<Box
			sx={{
				minHeight: '100vh',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				background: 'radial-gradient(ellipse at top, #1e1b4b 0%, #0b1320 60%, #030712 100%)',
				p: 2,
			}}
		>
			<Paper
				elevation={6}
				sx={{
					width: '100%',
					maxWidth: 460,
					borderRadius: 3.5,
					backgroundColor: '#0d1527',
					border: '1px solid rgba(255, 255, 255, 0.08)',
					boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
					overflow: 'hidden',
				}}
			>
				<Box sx={{ p: 4, textAlign: 'center' }}>
					<Box
						sx={{
							width: 52,
							height: 52,
							borderRadius: 2.5,
							background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
							display: 'inline-flex',
							alignItems: 'center',
							justifyContent: 'center',
							mb: 2,
							boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)',
						}}
					>
						<AppIcon />
					</Box>
					<Typography variant="h5" sx={{ fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
						Restricted Registration
					</Typography>
					<Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5 }}>
						Pentaract Distributed Cloud Storage
					</Typography>
					<Chip
						icon={<AdminPanelSettingsIcon sx={{ fontSize: '14px !important', color: '#818cf8 !important' }} />}
						label="Admin Controlled Access"
						size="small"
						sx={{ mt: 1.5, backgroundColor: 'rgba(99, 102, 241, 0.12)', color: '#818cf8', fontWeight: 600, fontSize: 11 }}
					/>
				</Box>

				<Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.06)' }} />

				<Box sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 3, textAlign: 'center' }}>
					<Box
						sx={{
							p: 2.5,
							borderRadius: 2.5,
							backgroundColor: 'rgba(99, 102, 241, 0.06)',
							border: '1px solid rgba(99, 102, 241, 0.2)',
							textAlign: 'left',
						}}
					>
						<Typography variant="subtitle2" sx={{ color: '#f8fafc', fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
							<LockIcon sx={{ fontSize: 18, color: '#818cf8' }} /> Private Vault Security Policy
						</Typography>
						<Typography variant="body2" sx={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.6 }}>
							Public self-registration is permanently disabled. To safeguard encrypted chunks and storage workers, user accounts must be provisioned directly by the system administrator from the <strong>User Accounts</strong> management dashboard.
						</Typography>
					</Box>

					<Button
						variant="contained"
						size="large"
						startIcon={<ArrowBackIcon />}
						onClick={() => navigate('/login')}
						sx={{
							background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
							color: 'white',
							textTransform: 'none',
							fontWeight: 700,
							py: 1.4,
							borderRadius: 2,
							boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
						}}
					>
						Return to Sign In
					</Button>
				</Box>
			</Paper>
		</Box>
	)
}

export default Register
