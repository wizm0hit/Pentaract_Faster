import Divider from '@suid/material/Divider'
import Box from '@suid/material/Box'
import Button from '@suid/material/Button'
import TextField from '@suid/material/TextField'
import Select from '@suid/material/Select'
import InputLabel from '@suid/material/InputLabel'
import FormControl from '@suid/material/FormControl'
import Typography from '@suid/material/Typography'
import Paper from '@suid/material/Paper'
import Alert from '@suid/material/Alert'
import MenuItem from '@suid/material/MenuItem'
import IconButton from '@suid/material/IconButton'
import HelpOutlineIcon from '@suid/icons-material/HelpOutline'
import ChevronLeftIcon from '@suid/icons-material/ChevronLeft'
import SmartToyIcon from '@suid/icons-material/SmartToy'
import SyncIcon from '@suid/icons-material/Sync'
import CheckCircleIcon from '@suid/icons-material/CheckCircle'
import { createSignal, mapArray, onMount, Show } from 'solid-js'
import { useNavigate } from '@solidjs/router'

import API from '../../api'
import { alertStore } from '../../components/AlertStack'
import SetupGuideDialog from '../../components/SetupGuideDialog'

const StorageWorkerCreateForm = () => {
	const [storages, setStorages] = createSignal([])
	const [selectedStorage, setSelectedStorage] = createSignal('')
	const [tokenValue, setTokenValue] = createSignal('')
	const [testingToken, setTestingToken] = createSignal(false)
	const [botTestResult, setBotTestResult] = createSignal(null)
	const [guideOpen, setGuideOpen] = createSignal(false)
	const { addAlert } = alertStore
	const navigate = useNavigate()

	onMount(async () => {
		try {
			const res = await API.storages.listStorages()
			setStorages(res.storages || [])
		} catch (err) {
			console.error(err)
		}
	})

	const handleTestToken = async () => {
		const token = tokenValue().trim()
		if (!token) {
			addAlert('Please enter a Telegram Bot Token first', 'warning')
			return
		}

		setTestingToken(true)
		setBotTestResult(null)
		try {
			const res = await API.telegram.testTelegramBot(token)
			setBotTestResult(res)
			if (res.valid) {
				addAlert(`Verified Telegram Bot: @${res.bot?.username || 'bot'}`, 'success')
			} else {
				addAlert(`Validation failed: ${res.error}`, 'error')
			}
		} catch (err) {
			setBotTestResult({ valid: false, error: 'Connection test failed' })
		} finally {
			setTestingToken(false)
		}
	}

	const handleSubmit = async (event) => {
		event.preventDefault()
		const data = new FormData(event.currentTarget)
		const name = data.get('name')
		const token = data.get('token')
		const storageId = selectedStorage() || null

		try {
			await API.storageWorkers.createStorageWorker(name, token, storageId)
			addAlert(`Registered storage worker "${name}"`, 'success')
			navigate('/storage_workers')
		} catch (err) {
			console.error(err)
		}
	}

	return (
		<Box sx={{ maxWidth: 580, mx: 'auto', pb: 6 }}>
			<Button
				onClick={() => navigate('/storage_workers')}
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
				Back to Workers
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
								background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								color: 'white',
							}}
						>
							<SmartToyIcon />
						</Box>
						<Box>
							<Typography variant="h5" sx={{ fontWeight: 800, color: '#f8fafc' }}>
								Register Storage Worker
							</Typography>
							<Typography variant="caption" sx={{ color: '#94a3b8' }}>
								Connect a Telegram Bot API worker instance
							</Typography>
						</Box>
					</Box>

					<IconButton
						onClick={() => setGuideOpen(true)}
						title="How to get Bot Token"
						sx={{ color: '#38bdf8', backgroundColor: 'rgba(56, 189, 248, 0.1)' }}
					>
						<HelpOutlineIcon />
					</IconButton>
				</Box>

				<Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', my: 2 }} />

				<Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
					<TextField
						id="name"
						name="name"
						label="Worker Name"
						placeholder="e.g. Cluster Bot 1 (High Speed)"
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

					<Box sx={{ display: 'flex', gap: 1 }}>
						<TextField
							id="token"
							name="token"
							label="Telegram Bot API Token"
							placeholder="e.g. 7192837465:AAHq_..."
							variant="outlined"
							value={tokenValue()}
							onChange={(e, val) => {
								const text = typeof val === 'string' ? val : (e?.target?.value ?? e?.currentTarget?.value ?? '')
								setTokenValue(text)
							}}
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
						<Button
							variant="outlined"
							onClick={handleTestToken}
							disabled={testingToken()}
							startIcon={<SyncIcon />}
							sx={{
								color: '#38bdf8',
								borderColor: 'rgba(56, 189, 248, 0.3)',
								textTransform: 'none',
								fontWeight: 600,
								whiteSpace: 'nowrap',
								px: 2,
							}}
						>
							{testingToken() ? 'Testing...' : 'Verify'}
						</Button>
					</Box>

					<Show when={botTestResult()}>
						<Alert
							severity={botTestResult().valid ? 'success' : 'error'}
							sx={{
								backgroundColor: botTestResult().valid ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
								color: '#cbd5e1',
								border: botTestResult().valid ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
								borderRadius: 2,
							}}
						>
							{botTestResult().valid
								? `Verified Telegram Bot: @${botTestResult().bot?.username || 'bot'}`
								: `Validation Error: ${botTestResult().error}`}
						</Alert>
					</Show>

					<FormControl fullWidth>
						<InputLabel id="storage-select-label" sx={{ color: '#94a3b8' }}>
							Assigned Vault (Optional)
						</InputLabel>
						<Select
							labelId="storage-select-label"
							id="storage_id"
							name="storage_id"
							value={selectedStorage()}
							onChange={(e) => setSelectedStorage(e.target.value)}
							label="Assigned Vault (Optional)"
							sx={{
								color: '#f8fafc',
								backgroundColor: 'rgba(255, 255, 255, 0.03)',
								borderRadius: 2,
							}}
						>
							<MenuItem value="">
								<em>Global Cluster (Available to all vaults)</em>
							</MenuItem>
							{mapArray(storages, (storage) => (
								<MenuItem value={storage.id}>{storage.name}</MenuItem>
							))}
						</Select>
					</FormControl>

					<Button
						type="submit"
						variant="contained"
						size="large"
						sx={{
							background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
							color: 'white',
							textTransform: 'none',
							fontWeight: 700,
							py: 1.5,
							borderRadius: 2,
							boxShadow: '0 4px 14px rgba(56, 189, 248, 0.4)',
						}}
					>
						Save Storage Worker
					</Button>
				</Box>
			</Paper>

			<SetupGuideDialog isOpened={guideOpen()} onClose={() => setGuideOpen(false)} />
		</Box>
	)
}

export default StorageWorkerCreateForm
