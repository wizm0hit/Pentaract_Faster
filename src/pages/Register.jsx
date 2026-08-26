import { createSignal } from 'solid-js'
import Box from '@suid/material/Box'
import TextField from '@suid/material/TextField'
import Button from '@suid/material/Button'
import Paper from '@suid/material/Paper'
import Typography from '@suid/material/Typography'
import Divider from '@suid/material/Divider'
import Chip from '@suid/material/Chip'
import Alert from '@suid/material/Alert'
import ShieldIcon from '@suid/icons-material/Shield'
import { A, useNavigate } from '@solidjs/router'

import createLocalStore from '../../libs'
import API from '../api'
import AppIcon from '../components/AppIcon'
import { alertStore } from '../components/AlertStack'

const Register = () => {
	const [store, setStore] = createLocalStore()
	const { addAlert } = alertStore
	const navigate = useNavigate()
	const [loading, setLoading] = createSignal(false)
	const [errorMsg, setErrorMsg] = createSignal('')
	const [emailVal, setEmailVal] = createSignal('')
	const [passVal, setPassVal] = createSignal('')
	const [confirmPassVal, setConfirmPassVal] = createSignal('')

	const handleSubmit = async (event) => {
		event.preventDefault()
		setErrorMsg('')

		const email = (emailVal() || '').trim()
		const password = passVal() || ''
		const confirmPassword = confirmPassVal() || ''

		if (!email || !password) {
			setErrorMsg('Please fill in all fields.')
			return
		}

		if (password.length < 4) {
			setErrorMsg('Password must be at least 4 characters long.')
			return
		}

		if (password !== confirmPassword) {
			setErrorMsg('Passwords do not match.')
			return
		}

		setLoading(true)
		try {
			const res = await API.auth.register(email, password)
			setStore('access_token', res.access_token)
			setStore('user', res.user || { email, role: 'user' })
			addAlert('Account created successfully! Welcome.', 'success')
			navigate('/storages')
		} catch (err) {
			console.error(err)
			setErrorMsg(err.message || 'Registration failed. Please try again.')
		} finally {
			setLoading(false)
		}
	}

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
					maxWidth: 440,
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
						Create Account
					</Typography>
					<Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5 }}>
						Pentaract Encrypted Cloud Vault
					</Typography>
					<Chip
						icon={<ShieldIcon sx={{ fontSize: '13px !important', color: '#10b981 !important' }} />}
						label="AES-256-GCM Encrypted Vault"
						size="small"
						sx={{ mt: 1.5, backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', fontWeight: 600, fontSize: 11 }}
					/>
				</Box>

				<Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.06)' }} />

				<Box component="form" onSubmit={handleSubmit} sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
					{errorMsg() && (
						<Alert severity="error" sx={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 2 }}>
							{errorMsg()}
						</Alert>
					)}

					<TextField
						name="email"
						label="Email Address"
						type="email"
						value={emailVal()}
						onChange={(e) => setEmailVal(e.target.value)}
						placeholder="user@example.com"
						variant="outlined"
						fullWidth
						required
						InputLabelProps={{ sx: { color: '#94a3b8' } }}
						InputProps={{
							sx: {
								color: '#f8fafc',
								backgroundColor: 'rgba(255, 255, 255, 0.03)',
								borderRadius: 2,
							},
						}}
					/>

					<TextField
						name="password"
						label="Password"
						type="password"
						value={passVal()}
						onChange={(e) => setPassVal(e.target.value)}
						placeholder="••••••••"
						variant="outlined"
						fullWidth
						required
						InputLabelProps={{ sx: { color: '#94a3b8' } }}
						InputProps={{
							sx: {
								color: '#f8fafc',
								backgroundColor: 'rgba(255, 255, 255, 0.03)',
								borderRadius: 2,
							},
						}}
					/>

					<TextField
						name="confirmPassword"
						label="Confirm Password"
						type="password"
						value={confirmPassVal()}
						onChange={(e) => setConfirmPassVal(e.target.value)}
						placeholder="••••••••"
						variant="outlined"
						fullWidth
						required
						InputLabelProps={{ sx: { color: '#94a3b8' } }}
						InputProps={{
							sx: {
								color: '#f8fafc',
								backgroundColor: 'rgba(255, 255, 255, 0.03)',
								borderRadius: 2,
							},
						}}
					/>

					<Button
						type="submit"
						variant="contained"
						size="large"
						disabled={loading()}
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
						{loading() ? 'Creating Account...' : 'Sign Up & Continue'}
					</Button>

					<Box sx={{ textAlign: 'center', mt: 0.5 }}>
						<Typography variant="body2" sx={{ color: '#94a3b8', fontSize: 13 }}>
							Already have an account?{' '}
							<A href="/login" style={{ color: '#818cf8', 'text-decoration': 'none', 'font-weight': 600 }}>
								Sign In
							</A>
						</Typography>
					</Box>
				</Box>
			</Paper>
		</Box>
	)
}

export default Register
