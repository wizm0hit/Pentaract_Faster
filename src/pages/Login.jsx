import { onMount } from 'solid-js'
import Container from '@suid/material/Container'
import Box from '@suid/material/Box'
import TextField from '@suid/material/TextField'
import Button from '@suid/material/Button'
import Paper from '@suid/material/Paper'
import Typography from '@suid/material/Typography'
import Divider from '@suid/material/Divider'
import Chip from '@suid/material/Chip'
import ShieldIcon from '@suid/icons-material/Shield'
import LockIcon from '@suid/icons-material/Lock'
import { A, useNavigate } from '@solidjs/router'

import createLocalStore from '../../libs'
import API from '../api'
import AppIcon from '../components/AppIcon'
import { alertStore } from '../components/AlertStack'

const Login = () => {
	const [store, setStore] = createLocalStore()
	const { addAlert } = alertStore
	const navigate = useNavigate()

	onMount(() => {
		if (store.access_token) {
			navigate('/storages')
		}
	})

	const handleSubmit = async (event) => {
		event.preventDefault()
		const data = new FormData(event.currentTarget)
		const email = data.get('email')
		const password = data.get('password')

		try {
			const tokenData = await API.auth.login(email, password)
			setStore('access_token', tokenData.access_token)
			setStore('user', { email })
			addAlert('Logged in successfully', 'success')

			const redirect_url = store.redirect || '/storages'
			navigate(redirect_url)
		} catch (err) {
			console.error(err)
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
						Pentaract Faster
					</Typography>
					<Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5 }}>
						Secure Distributed Cloud Storage
					</Typography>
					<Chip
						icon={<ShieldIcon sx={{ fontSize: '13px !important', color: '#10b981 !important' }} />}
						label="AES-256-GCM Encrypted"
						size="small"
						sx={{ mt: 1.5, backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', fontWeight: 600, fontSize: 11 }}
					/>
				</Box>

				<Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.06)' }} />

				<Box component="form" onSubmit={handleSubmit} sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
					<TextField
						name="email"
						label="Email Address"
						type="email"
						placeholder="admin@pentaract.local"
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
						Sign In
					</Button>

					<Box sx={{ textAlign: 'center', mt: 1 }}>
						<A href="/register" style={{ color: '#818cf8', 'text-decoration': 'none', 'font-size': '14px', 'font-weight': 600 }}>
							Don't have an account? Create one
						</A>
					</Box>
				</Box>
			</Paper>
		</Box>
	)
}

export default Login
