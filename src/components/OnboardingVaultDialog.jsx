import Dialog from '@suid/material/Dialog'
import DialogTitle from '@suid/material/DialogTitle'
import DialogContent from '@suid/material/DialogContent'
import DialogActions from '@suid/material/DialogActions'
import Typography from '@suid/material/Typography'
import Button from '@suid/material/Button'
import Box from '@suid/material/Box'
import TextField from '@suid/material/TextField'
import Divider from '@suid/material/Divider'
import Alert from '@suid/material/Alert'
import Chip from '@suid/material/Chip'
import Stack from '@suid/material/Stack'
import IconButton from '@suid/material/IconButton'
import CloseIcon from '@suid/icons-material/Close'
import StorageIcon from '@suid/icons-material/Storage'
import SmartToyIcon from '@suid/icons-material/SmartToy'
import SendIcon from '@suid/icons-material/Send'
import ShieldIcon from '@suid/icons-material/Shield'
import CheckCircleOutlineIcon from '@suid/icons-material/CheckCircleOutline'
import ContentCopyIcon from '@suid/icons-material/ContentCopy'
import ArrowForwardIcon from '@suid/icons-material/ArrowForward'
import { createSignal, Show } from 'solid-js'
import { useNavigate } from '@solidjs/router'
import API from '../api'
import { alertStore } from './AlertStack'

export default function OnboardingVaultDialog(props) {
	const { addAlert } = alertStore
	const navigate = useNavigate()

	const [vaultName, setVaultName] = createSignal('')
	const [chatId, setChatId] = createSignal('')
	const [botToken, setBotToken] = createSignal('')
	const [chatIdErr, setChatIdErr] = createSignal(null)
	const [isSubmitting, setIsSubmitting] = createSignal(false)
	const [copiedKey, setCopiedKey] = createSignal('')

	const copyText = (key, text) => {
		navigator.clipboard.writeText(text)
		setCopiedKey(key)
		addAlert('Copied to clipboard', 'info')
		setTimeout(() => setCopiedKey(''), 2000)
	}

	const extractInputValue = (e, val) => {
		if (typeof val === 'string') return val
		if (e && e.target && typeof e.target.value === 'string') return e.target.value
		if (e && e.currentTarget && typeof e.currentTarget.value === 'string') return e.currentTarget.value
		return ''
	}

	const handleNameChange = (e, val) => {
		const text = extractInputValue(e, val)
		setVaultName(text)
	}

	const handleChatIdChange = (e, val) => {
		const text = extractInputValue(e, val)
		setChatId(text)
		const num = parseInt(text)
		if (text && !isNaN(num) && num > 0) {
			setChatIdErr('Channel IDs must be negative (e.g. -1001928374650)')
		} else {
			setChatIdErr(null)
		}
	}

	const handleBotTokenChange = (e, val) => {
		const text = extractInputValue(e, val)
		setBotToken(text)
	}

	const handleQuickCreate = async (e) => {
		e.preventDefault()
		const formData = new FormData(e.currentTarget)
		const name = (formData.get('name') || vaultName() || '').toString().trim()
		const rawChatIdStr = (formData.get('chat_id') || chatId() || '').toString().trim()
		const token = (formData.get('bot_token') || botToken() || '').toString().trim()
		const rawChatId = parseInt(rawChatIdStr)

		if (!name) {
			addAlert('Please enter a name for your vault', 'warning')
			return
		}
		if (!rawChatId || isNaN(rawChatId)) {
			setChatIdErr('Please enter a valid numeric Telegram Channel Chat ID (e.g. -1001928374650)')
			return
		}

		setIsSubmitting(true)
		try {
			// If bot token is provided, register worker first
			if (token) {
				await API.storageWorkers.createStorageWorker('Primary Telegram Worker', token, null)
			}

			// Create storage vault
			const created = await API.storages.createStorage(name, rawChatId)
			addAlert(`Storage Vault "${name}" successfully registered!`, 'success')
			
			if (props.onCreated) {
				props.onCreated(created)
			}
			props.onClose()
		} catch (err) {
			console.error(err)
			addAlert('Failed to create storage vault. Please verify your Chat ID and Bot Token.', 'error')
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Dialog
			open={props.open}
			onClose={props.onClose}
			maxWidth="md"
			fullWidth
			PaperProps={{
				sx: {
					backgroundColor: '#0a0f1d',
					color: '#f8fafc',
					borderRadius: 3.5,
					border: '1px solid rgba(255, 255, 255, 0.1)',
					boxShadow: '0 24px 64px rgba(0, 0, 0, 0.6)',
					overflow: 'hidden',
				},
			}}
		>
			<DialogTitle
				sx={{
					p: 3,
					pb: 2,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.12) 0%, transparent 100%)',
				}}
			>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
					<Box
						sx={{
							width: 44,
							height: 44,
							borderRadius: 2,
							background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							color: 'white',
						}}
					>
						<StorageIcon fontSize="medium" />
					</Box>
					<Box>
						<Typography variant="h6" sx={{ fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.01em' }}>
							Set Up Your First Storage Vault
						</Typography>
						<Typography variant="caption" sx={{ color: '#94a3b8' }}>
							Connect your Telegram Channel to start storing AES-256-GCM encrypted files
						</Typography>
					</Box>
				</Box>
				<IconButton onClick={props.onClose} sx={{ color: '#94a3b8', '&:hover': { color: '#f8fafc' } }}>
					<CloseIcon />
				</IconButton>
			</DialogTitle>

			<DialogContent sx={{ p: 3, pt: 1 }}>
				{/* 3 Quick Step Cards */}
				<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 1.5, mb: 3 }}>
					<Box
						sx={{
							p: 2,
							borderRadius: 2.5,
							backgroundColor: 'rgba(255, 255, 255, 0.03)',
							border: '1px solid rgba(255, 255, 255, 0.06)',
						}}
					>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
							<Chip label="1" size="small" sx={{ backgroundColor: '#6366f1', color: 'white', fontWeight: 800, height: 20, width: 20 }} />
							<Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#f8fafc' }}>
								Create Channel
							</Typography>
						</Box>
						<Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', lineHeight: 1.4 }}>
							Create a <strong>Private Channel</strong> in Telegram to store your encrypted 5 MB chunk files.
						</Typography>
					</Box>

					<Box
						sx={{
							p: 2,
							borderRadius: 2.5,
							backgroundColor: 'rgba(255, 255, 255, 0.03)',
							border: '1px solid rgba(255, 255, 255, 0.06)',
						}}
					>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
							<Chip label="2" size="small" sx={{ backgroundColor: '#6366f1', color: 'white', fontWeight: 800, height: 20, width: 20 }} />
							<Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#f8fafc' }}>
								Add Bot Admin
							</Typography>
						</Box>
						<Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', lineHeight: 1.4 }}>
							Add your Telegram Bot from <strong>@BotFather</strong> as an <strong>Administrator</strong> with post permissions.
						</Typography>
					</Box>

					<Box
						sx={{
							p: 2,
							borderRadius: 2.5,
							backgroundColor: 'rgba(255, 255, 255, 0.03)',
							border: '1px solid rgba(255, 255, 255, 0.06)',
						}}
					>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
							<Chip label="3" size="small" sx={{ backgroundColor: '#6366f1', color: 'white', fontWeight: 800, height: 20, width: 20 }} />
							<Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#f8fafc' }}>
								Get Chat ID
							</Typography>
						</Box>
						<Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', lineHeight: 1.4 }}>
							Forward any channel post to <strong>@getmyid_bot</strong> to get the negative ID (e.g. <code>-1001928374650</code>).
						</Typography>
					</Box>
				</Box>

				{/* Quick Setup Form */}
				<Box
					component="form"
					onSubmit={handleQuickCreate}
					sx={{
						p: 2.5,
						borderRadius: 3,
						backgroundColor: '#0f172a',
						border: '1px solid rgba(99, 102, 241, 0.2)',
						display: 'flex',
						flexDirection: 'column',
						gap: 2.5,
					}}
				>
					<Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#818cf8', display: 'flex', alignItems: 'center', gap: 1 }}>
						<CheckCircleOutlineIcon fontSize="small" /> Quick Vault Registration
					</Typography>

					<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
						<TextField
							id="onboarding-vault-name"
							name="name"
							label="Vault Name"
							placeholder="e.g. Personal Cloud"
							value={vaultName()}
							onChange={handleNameChange}
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
							id="onboarding-chat-id"
							name="chat_id"
							label="Telegram Channel Chat ID"
							placeholder="e.g. -1001928374650"
							value={chatId()}
							onChange={handleChatIdChange}
							error={Boolean(chatIdErr())}
							helperText={chatIdErr() || 'Must be a negative number starting with -100'}
							variant="outlined"
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
					</Box>

					<TextField
						id="onboarding-bot-token"
						name="bot_token"
						label="Telegram Bot Token (Optional if already configured)"
						placeholder="e.g. 7192837465:AAHq_your_bot_token_from_botfather"
						value={botToken()}
						onChange={handleBotTokenChange}
						variant="outlined"
						fullWidth
						helperText="If you haven't added a Telegram Bot Worker yet, paste your BotFather token here to configure it automatically."
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

					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
							<ShieldIcon sx={{ color: '#10b981', fontSize: 18 }} />
							<Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600 }}>
								AES-256-GCM NIST Authenticated Encryption Enabled
							</Typography>
						</Box>

						<Button
							type="submit"
							variant="contained"
							disabled={isSubmitting()}
							endIcon={<ArrowForwardIcon />}
							sx={{
								background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
								color: 'white',
								textTransform: 'none',
								fontWeight: 700,
								px: 3,
								py: 1,
								borderRadius: 2,
								boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
							}}
						>
							{isSubmitting() ? 'Registering...' : 'Create Vault & Start Storing'}
						</Button>
					</Box>
				</Box>
			</DialogContent>

			<DialogActions sx={{ p: 2.5, px: 3, backgroundColor: 'rgba(255, 255, 255, 0.02)', justifyContent: 'space-between' }}>
				<Button
					onClick={() => {
						props.onClose()
						navigate('/setup-guide')
					}}
					sx={{ color: '#94a3b8', textTransform: 'none', fontSize: 13 }}
				>
					View Full Step-by-Step Guide
				</Button>
				<Button
					onClick={props.onClose}
					sx={{ color: '#cbd5e1', textTransform: 'none', fontWeight: 600 }}
				>
					Dismiss
				</Button>
			</DialogActions>
		</Dialog>
	)
}
