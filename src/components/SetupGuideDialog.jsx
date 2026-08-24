import Dialog from '@suid/material/Dialog'
import DialogContent from '@suid/material/DialogContent'
import DialogTitle from '@suid/material/DialogTitle'
import DialogActions from '@suid/material/DialogActions'
import Typography from '@suid/material/Typography'
import Button from '@suid/material/Button'
import Box from '@suid/material/Box'
import Paper from '@suid/material/Paper'
import Chip from '@suid/material/Chip'
import Divider from '@suid/material/Divider'
import ContentCopyIcon from '@suid/icons-material/ContentCopy'
import CheckCircleIcon from '@suid/icons-material/CheckCircle'
import LockIcon from '@suid/icons-material/Lock'
import SmartToyIcon from '@suid/icons-material/SmartToy'
import CloudUploadIcon from '@suid/icons-material/CloudUpload'
import { createSignal } from 'solid-js'
import { alertStore } from './AlertStack'

/**
 * @param {{ isOpened: boolean, onClose: () => void }} props
 */
const SetupGuideDialog = (props) => {
	const { addAlert } = alertStore
	const [copiedKey, setCopiedKey] = createSignal('')

	const copyToClipboard = (text, label) => {
		navigator.clipboard.writeText(text)
		setCopiedKey(label)
		addAlert(`Copied ${label} to clipboard!`, 'success')
		setTimeout(() => setCopiedKey(''), 2000)
	}

	const railwayEnvTemplate = `# Pentaract Faster - Required & Recommended Railway Variables
PORT=3000
NODE_ENV=production
SECRET_KEY=generate_a_random_32_character_secret_here
CHUNK_SIZE_MB=5
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather

# Optional (Defaults are already baked-in)
# SUPERUSER_EMAIL=admin@pentaract.local
# SUPERUSER_PASS=admin123
# ACCESS_TOKEN_EXPIRE_IN_SECS=2592000
`

	return (
		<Dialog
			open={props.isOpened}
			onClose={props.onClose}
			maxWidth="md"
			fullWidth
			PaperProps={{
				sx: {
					borderRadius: 3,
					background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
					color: '#f8fafc',
					border: '1px solid rgba(255, 255, 255, 0.1)',
				},
			}}
		>
			<DialogTitle
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					borderBottom: '1px solid rgba(255,255,255,0.08)',
					pb: 2,
				}}
			>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
					<Box
						sx={{
							width: 36,
							height: 36,
							borderRadius: 2,
							background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<SmartToyIcon sx={{ color: 'white', fontSize: 20 }} />
					</Box>
					<Box>
						<Typography variant="h6" sx={{ fontWeight: 700 }}>
							Telegram Bot & Railway Deployment Guide
						</Typography>
						<Typography variant="caption" sx={{ color: '#94a3b8' }}>
							Pentaract Faster Setup & AES-256-GCM Storage Architecture
						</Typography>
					</Box>
				</Box>
				<Chip
					icon={<LockIcon sx={{ fontSize: '14px !important', color: '#10b981 !important' }} />}
					label="AES-256-GCM"
					size="small"
					sx={{
						backgroundColor: 'rgba(16, 185, 129, 0.15)',
						color: '#10b981',
						fontWeight: 600,
						border: '1px solid rgba(16, 185, 129, 0.3)',
					}}
				/>
			</DialogTitle>

			<DialogContent sx={{ py: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
				{/* Step 1 */}
				<Paper
					sx={{
						p: 2.5,
						backgroundColor: 'rgba(255, 255, 255, 0.03)',
						borderRadius: 2.5,
						border: '1px solid rgba(255, 255, 255, 0.06)',
					}}
				>
					<Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#38bdf8', mb: 1 }}>
						1. Create Telegram Bot via @BotFather
					</Typography>
					<Typography variant="body2" sx={{ color: '#cbd5e1', mb: 1.5, lineHeight: 1.6 }}>
						1. Open Telegram and search for <strong>@BotFather</strong> (official verified bot).<br />
						2. Send <code>/newbot</code> and follow the prompts to choose a Name and Username (e.g. <code>my_vault_worker_bot</code>).<br />
						3. BotFather will reply with your <strong>HTTP API Token</strong> (looks like <code>7192837465:AAHq...</code>).<br />
						4. Keep this token safe — you will register it in Pentaract as a <strong>Storage Worker</strong>.
					</Typography>
				</Paper>

				{/* Step 2 */}
				<Paper
					sx={{
						p: 2.5,
						backgroundColor: 'rgba(255, 255, 255, 0.03)',
						borderRadius: 2.5,
						border: '1px solid rgba(255, 255, 255, 0.06)',
					}}
				>
					<Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#f59e0b', mb: 1 }}>
						2. Create Telegram Channel / Supergroup & Get Chat ID
					</Typography>
					<Typography variant="body2" sx={{ color: '#cbd5e1', mb: 1.5, lineHeight: 1.6 }}>
						1. In Telegram, create a new <strong>Private Channel</strong> or <strong>Group</strong> (e.g., "Cloud Vault Chunks").<br />
						2. Add your newly created Bot to the Channel as an <strong>Administrator</strong> with permissions to <em>Post Messages</em> and <em>Edit/Delete Messages</em>.<br />
						3. Retrieve the numeric <strong>Chat ID</strong>:
						<br />&bull; Forward any message from the channel to <strong>@username_to_id_bot</strong> or <strong>@getmyid_bot</strong>.
						<br />&bull; Or visit <code>https://api.telegram.org/bot&lt;YOUR_BOT_TOKEN&gt;/getUpdates</code> in your browser.
						<br />&bull; The channel ID will be a negative number starting with <code>-100...</code> (e.g. <code>-1001928374650</code>).
					</Typography>
				</Paper>

				{/* Step 3 */}
				<Paper
					sx={{
						p: 2.5,
						backgroundColor: 'rgba(255, 255, 255, 0.03)',
						borderRadius: 2.5,
						border: '1px solid rgba(255, 255, 255, 0.06)',
					}}
				>
					<Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#10b981', mb: 1 }}>
						3. Register Storage & Storage Workers in Pentaract
					</Typography>
					<Typography variant="body2" sx={{ color: '#cbd5e1', mb: 1.5, lineHeight: 1.6 }}>
						1. Go to <strong>Storages &rarr; Register New</strong> and enter your Storage Name and the negative <code>chat_id</code>.<br />
						2. Go to <strong>Storage Workers &rarr; Register New</strong> and add your Bot Token.<br />
						3. You can add multiple Telegram Bots as Storage Workers to distribute chunks across bots and bypass rate limits!
					</Typography>
				</Paper>

				{/* Step 4 */}
				<Paper
					sx={{
						p: 2.5,
						backgroundColor: 'rgba(255, 255, 255, 0.03)',
						borderRadius: 2.5,
						border: '1px solid rgba(255, 255, 255, 0.06)',
					}}
				>
					<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
						<Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#a855f7' }}>
							4. Railway.com Deployment Setup
						</Typography>
						<Button
							size="small"
							variant="outlined"
							startIcon={<ContentCopyIcon />}
							onClick={() => copyToClipboard(railwayEnvTemplate, 'Railway Config')}
							sx={{
								color: '#a855f7',
								borderColor: 'rgba(168, 85, 247, 0.4)',
								textTransform: 'none',
							}}
						>
							{copiedKey() === 'Railway Config' ? 'Copied!' : 'Copy Env Config'}
						</Button>
					</Box>
					<Typography variant="body2" sx={{ color: '#cbd5e1', mb: 1.5, lineHeight: 1.6 }}>
						1. Log into <strong>railway.com</strong> and click <strong>New Project &rarr; Deploy from GitHub repo</strong>.<br />
						2. Select this repository.<br />
						3. Under <strong>Variables</strong>, configure:
					</Typography>
					<Box
						component="pre"
						sx={{
							p: 1.5,
							borderRadius: 1.5,
							backgroundColor: '#090d16',
							color: '#38bdf8',
							fontSize: 12,
							fontFamily: 'monospace',
							overflowX: 'auto',
							border: '1px solid rgba(255, 255, 255, 0.1)',
						}}
					>
						{railwayEnvTemplate}
					</Box>
					<Typography variant="body2" sx={{ color: '#94a3b8', mt: 1, fontSize: 13 }}>
						4. Under <strong>Settings &rarr; Networking</strong>, click <strong>Generate Domain</strong> to get your public HTTPS URL.
					</Typography>
				</Paper>
			</DialogContent>

			<DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
				<Button
					onClick={props.onClose}
					variant="contained"
					sx={{
						background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
						color: 'white',
						textTransform: 'none',
						fontWeight: 600,
						px: 3,
					}}
				>
					Got It, Close Guide
				</Button>
			</DialogActions>
		</Dialog>
	)
}

export default SetupGuideDialog
