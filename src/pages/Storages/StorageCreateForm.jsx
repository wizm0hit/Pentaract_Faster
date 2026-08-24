import Divider from '@suid/material/Divider'
import Box from '@suid/material/Box'
import Button from '@suid/material/Button'
import TextField from '@suid/material/TextField'
import Typography from '@suid/material/Typography'
import Paper from '@suid/material/Paper'
import Alert from '@suid/material/Alert'
import Stack from '@suid/material/Stack'
import IconButton from '@suid/material/IconButton'
import ChevronLeftIcon from '@suid/icons-material/ChevronLeft'
import HelpOutlineIcon from '@suid/icons-material/HelpOutline'
import StorageIcon from '@suid/icons-material/Storage'
import ShieldIcon from '@suid/icons-material/Shield'
import { createSignal } from 'solid-js'
import { useNavigate } from '@solidjs/router'

import API from '../../api'
import { alertStore } from '../../components/AlertStack'
import SetupGuideDialog from '../../components/SetupGuideDialog'

const StorageCreateForm = () => {
	const [chatIdErr, setChatIdErr] = createSignal(null)
	const [guideOpen, setGuideOpen] = createSignal(false)
	const { addAlert } = alertStore
	const navigate = useNavigate()

	const handleSubmit = async (event) => {
		event.preventDefault()
		const data = new FormData(event.currentTarget)
		const name = data.get('name')
		const chatId = parseInt(data.get('chat_id'))

		if (!chatId || isNaN(chatId)) {
			setChatIdErr('Please enter a valid numeric Telegram Channel Chat ID (e.g. -100192837465)')
			return
		}

		try {
			await API.storages.createStorage(name, chatId)
			addAlert(`Created storage vault "${name}"`, 'success')
			navigate('/storages')
		} catch (err) {
			console.error(err)
		}
	}

	const validateChatId = (event, value) => {
		const raw = typeof value === 'string' ? value : (event?.target?.value ?? event?.currentTarget?.value ?? '')
		const num = parseInt(raw)
		if (raw && !isNaN(num) && num > 0) {
			setChatIdErr('Telegram Channel Chat IDs are negative numbers (e.g. -100192837465)')
		} else {
			setChatIdErr(null)
		}
	}

	return (
		<Box sx={{ maxWidth: 580, mx: 'auto', pb: 6 }}>
			<Button
				onClick={() => navigate('/storages')}
				variant="outlined"
				startIcon={<ChevronLeftIcon />}
				sx={{
					color: '#94a3b8',
					borderColor: 'rgba(255, 255, 255, 0.1)',
					textTransform: 'none',
					mb: 3,
					'&:hover': { color: '#f8fafc', borderColor: 'rgba(255, 255, 255, 0.3)' },
				}}
			>
				Back to Vaults
			</Button>

			<Paper
				sx={{
					p: 4,
					borderRadius: 3,
					backgroundColor: '#0d1527',
					border: '1px solid rgba(255, 255, 255, 0.08)',
					boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
				}}
			>
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
						<Box
							sx={{
								width: 42,
								height: 42,
								borderRadius: 2,
								background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								color: 'white',
							}}
						>
							<StorageIcon />
						</Box>
						<Box>
							<Typography variant="h5" sx={{ fontWeight: 800, color: '#f8fafc' }}>
								Register Storage Vault
							</Typography>
							<Typography variant="caption" sx={{ color: '#94a3b8' }}>
								AES-256-GCM Encrypted Telegram Cluster
							</Typography>
						</Box>
					</Box>

					<IconButton
						onClick={() => setGuideOpen(true)}
						title="View Chat ID instructions"
						sx={{ color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.1)' }}
					>
						<HelpOutlineIcon />
					</IconButton>
				</Box>

				<Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', my: 2 }} />

				<Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
					<TextField
						id="name"
						name="name"
						label="Vault Name"
						placeholder="e.g. Primary Cloud Vault"
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
						id="chat_id"
						name="chat_id"
						label="Telegram Channel Chat ID"
						placeholder="e.g. -100192837465"
						type="text"
						variant="outlined"
						onChange={validateChatId}
						helperText={chatIdErr() || 'Must be a negative integer starting with -100... for channels/groups'}
						error={Boolean(chatIdErr())}
						fullWidth
						required
						InputLabelProps={{ sx: { color: '#94a3b8' } }}
						InputProps={{
							sx: {
								color: '#f8fafc',
								backgroundColor: 'rgba(255, 255, 255, 0.03)',
								borderRadius: 2,
								fontFamily: 'monospace',
							},
						}}
					/>

					<Alert
						severity="info"
						sx={{
							backgroundColor: 'rgba(99, 102, 241, 0.1)',
							color: '#cbd5e1',
							border: '1px solid rgba(99, 102, 241, 0.2)',
							borderRadius: 2,
							'& .MuiAlert-icon': { color: '#818cf8' },
						}}
					>
						Ensure your Telegram Storage Worker Bot has been added as an <strong>Administrator</strong> to this channel.
					</Alert>

					<Button
						type="submit"
						variant="contained"
						size="large"
						sx={{
							background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
							color: 'white',
							textTransform: 'none',
							fontWeight: 700,
							py: 1.5,
							borderRadius: 2,
							boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
						}}
					>
						Register Storage Vault
					</Button>
				</Box>
			</Paper>

			<SetupGuideDialog isOpened={guideOpen()} onClose={() => setGuideOpen(false)} />
		</Box>
	)
}

export default StorageCreateForm
