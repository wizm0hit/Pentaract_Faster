import Typography from '@suid/material/Typography'
import Grid from '@suid/material/Grid'
import Stack from '@suid/material/Stack'
import Paper from '@suid/material/Paper'
import Table from '@suid/material/Table'
import TableBody from '@suid/material/TableBody'
import TableCell from '@suid/material/TableCell'
import TableContainer from '@suid/material/TableContainer'
import TableHead from '@suid/material/TableHead'
import TableRow from '@suid/material/TableRow'
import Button from '@suid/material/Button'
import Box from '@suid/material/Box'
import Chip from '@suid/material/Chip'
import IconButton from '@suid/material/IconButton'
import SmartToyIcon from '@suid/icons-material/SmartToy'
import AddIcon from '@suid/icons-material/Add'
import VisibilityIcon from '@suid/icons-material/Visibility'
import VisibilityOffIcon from '@suid/icons-material/VisibilityOff'
import DeleteOutlineIcon from '@suid/icons-material/DeleteOutline'
import CheckCircleIcon from '@suid/icons-material/CheckCircle'
import SyncIcon from '@suid/icons-material/Sync'
import HubIcon from '@suid/icons-material/Hub'
import { Show, createSignal, mapArray, onMount } from 'solid-js'
import { useNavigate } from '@solidjs/router'

import API from '../../api'
import { alertStore } from '../../components/AlertStack'
import ActionConfirmDialog from '../../components/ActionConfirmDialog'
import { checkAdmin } from '../../common/auth_guard'

const StorageWorkers = () => {
	checkAdmin()
	const { addAlert } = alertStore
	const [storageWorkers, setStorageWorkers] = createSignal([])
	const [visibleTokens, setVisibleTokens] = createSignal({})
	const [testingWorkerId, setTestingWorkerId] = createSignal(null)
	const [selectedWorkerToDelete, setSelectedWorkerToDelete] = createSignal(null)
	const navigate = useNavigate()

	const fetchStorageWorkers = async () => {
		try {
			const list = await API.storageWorkers.listStorageWorkers()
			setStorageWorkers(list || [])
		} catch (err) {
			console.error(err)
		}
	}

	onMount(() => {
		if (checkAdmin()) {
			fetchStorageWorkers()
		}
	})

	const toggleTokenVisibility = (id) => {
		setVisibleTokens((prev) => ({
			...prev,
			[id]: !prev[id],
		}))
	}

	const testBotToken = async (worker) => {
		setTestingWorkerId(worker.id)
		try {
			const res = await API.telegram.testTelegramBot(worker.token)
			if (res.valid) {
				addAlert(
					`Worker "${worker.name}" is verified online! Connected as @${res.bot?.username || 'bot'}`,
					'success'
				)
			} else {
				addAlert(`Connection test failed: ${res.error || 'Invalid token'}`, 'error')
			}
		} catch (err) {
			addAlert('Worker connection check failed', 'error')
		} finally {
			setTestingWorkerId(null)
		}
	}

	const confirmDeleteWorker = async () => {
		const target = selectedWorkerToDelete()
		if (!target) return
		try {
			await API.storageWorkers.deleteStorageWorker(target.id)
			addAlert(`Deleted storage worker "${target.name}"`, 'success')
			setSelectedWorkerToDelete(null)
			await fetchStorageWorkers()
		} catch (err) {
			console.error(err)
		}
	}

	const maskToken = (token) => {
		if (!token) return ''
		if (token.length <= 10) return '••••••••'
		return token.substring(0, 4) + '••••••••••••••••' + token.substring(token.length - 4)
	}

	return (
		<Box sx={{ pb: 6 }}>
			{/* Page Header */}
			<Box
				sx={{
					display: 'flex',
					flexDirection: { xs: 'column', sm: 'row' },
					alignItems: { xs: 'flex-start', sm: 'center' },
					justifyContent: 'space-between',
					gap: 2,
					mb: 3,
				}}
			>
				<Box>
					<Typography
						variant="h5"
						sx={{
							fontWeight: 700,
							letterSpacing: '-0.02em',
							color: 'text.primary',
						}}
					>
						Storage Workers
					</Typography>
					<Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
						Active Telegram Bot cluster instances for parallel multi-chunk streaming & upload dispatch.
					</Typography>
				</Box>

				<Button
					onClick={() => navigate('/storage_workers/register')}
					variant="contained"
					startIcon={<AddIcon />}
					sx={{
						textTransform: 'none',
						fontWeight: 600,
						borderRadius: '8px',
						px: 2,
						py: 0.8,
					}}
				>
					Register Storage Worker
				</Button>
			</Box>

			{/* Info Paper */}
			<Paper
				sx={{
					p: 2,
					mb: 3,
					borderRadius: '10px',
					bgcolor: 'background.paper',
					border: '1px solid',
					borderColor: 'divider',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					flexWrap: 'wrap',
					gap: 2,
				}}
			>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
					<HubIcon sx={{ color: 'primary.main', fontSize: 22 }} />
					<Box>
						<Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
							High-Speed Multi-Bot Chunking Engine
						</Typography>
						<Typography variant="caption" sx={{ color: 'text.secondary' }}>
							Files are automatically sliced and dispatched across active worker bots in round-robin fashion to maximize throughput.
						</Typography>
					</Box>
				</Box>
				<Chip
					label={`${storageWorkers().length} Active Nodes`}
					size="small"
					sx={{ bgcolor: 'action.hover', color: 'success.main', fontWeight: 600 }}
				/>
			</Paper>

			{/* Workers Table */}
			<Paper
				sx={{
					borderRadius: '12px',
					bgcolor: 'background.paper',
					border: '1px solid',
					borderColor: 'divider',
					overflow: 'hidden',
				}}
			>
				<TableContainer>
					<Table sx={{ minWidth: 650 }}>
						<Show
							when={storageWorkers().length > 0}
							fallback={
								<Box sx={{ p: 6, textAlign: 'center' }}>
									<SmartToyIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
									<Typography variant="subtitle1" sx={{ color: 'text.primary', fontWeight: 600 }}>
										No Storage Workers Registered
									</Typography>
									<Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5, maxWidth: 420, mx: 'auto' }}>
										Create a Telegram Bot via @BotFather and register its HTTP token to enable distributed file uploading.
									</Typography>
									<Button
										onClick={() => navigate('/storage_workers/register')}
										variant="contained"
										size="small"
										sx={{ textTransform: 'none', fontWeight: 600 }}
									>
										Register Worker
									</Button>
								</Box>
							}
						>
							<TableHead>
								<TableRow sx={{ '& th': { bgcolor: 'action.hover', color: 'text.secondary', fontWeight: 600, borderColor: 'divider' } }}>
									<TableCell>Worker Node Name</TableCell>
									<TableCell>Status</TableCell>
									<TableCell>Telegram Bot API Token</TableCell>
									<TableCell>Assigned Vault</TableCell>
									<TableCell align="right">Actions</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{mapArray(storageWorkers, (sw) => (
									<TableRow
										sx={{
											'& td': { color: 'text.primary', borderColor: 'divider', py: 1.5 },
										}}
									>
										<TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>
											<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
												<Box
													sx={{
														width: 28,
														height: 28,
														borderRadius: '6px',
														bgcolor: 'action.hover',
														display: 'flex',
														alignItems: 'center',
														justifyContent: 'center',
														color: 'primary.main',
													}}
												>
													<SmartToyIcon fontSize="small" />
												</Box>
												<span>{sw.name}</span>
											</Box>
										</TableCell>
										<TableCell>
											<Chip
												icon={<CheckCircleIcon sx={{ fontSize: '13px !important', color: 'success.main !important' }} />}
												label="Operational"
												size="small"
												sx={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', fontWeight: 700, fontSize: 11 }}
											/>
										</TableCell>
										<TableCell>
											<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
												<Typography sx={{ fontFamily: 'monospace', fontSize: 12, color: '#94a3b8' }}>
													{visibleTokens()[sw.id] ? sw.token : maskToken(sw.token)}
												</Typography>
												<IconButton
													size="small"
													onClick={() => toggleTokenVisibility(sw.id)}
													sx={{ color: '#64748b', p: 0.5 }}
												>
													{visibleTokens()[sw.id] ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
												</IconButton>
											</Box>
										</TableCell>
										<TableCell>
											<Chip
												label={sw.storage_id ? 'Assigned' : 'All Vaults (Cluster)'}
												size="small"
												sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#cbd5e1', fontSize: 11 }}
											/>
										</TableCell>
										<TableCell align="right">
											<Button
												size="small"
												variant="outlined"
												startIcon={<SyncIcon />}
												onClick={() => testBotToken(sw)}
												disabled={testingWorkerId() === sw.id}
												sx={{
													color: '#38bdf8',
													borderColor: 'rgba(56, 189, 248, 0.3)',
													textTransform: 'none',
													fontSize: 12,
													fontWeight: 600,
													mr: 1,
												}}
											>
												{testingWorkerId() === sw.id ? 'Testing...' : 'Test Bot'}
											</Button>
											<IconButton
												size="small"
												onClick={() => setSelectedWorkerToDelete(sw)}
												sx={{ color: '#ef4444', '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.1)' } }}
											>
												<DeleteOutlineIcon fontSize="small" />
											</IconButton>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Show>
					</Table>
				</TableContainer>
			</Paper>

			<ActionConfirmDialog
				action="Delete"
				entity="storage worker"
				actionDescription={`remove storage worker "${selectedWorkerToDelete()?.name}"`}
				isOpened={Boolean(selectedWorkerToDelete())}
				onConfirm={confirmDeleteWorker}
				onCancel={() => setSelectedWorkerToDelete(null)}
			/>
		</Box>
	)
}

export default StorageWorkers
