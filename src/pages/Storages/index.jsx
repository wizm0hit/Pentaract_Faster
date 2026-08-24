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
import StorageIcon from '@suid/icons-material/Storage'
import AddIcon from '@suid/icons-material/Add'
import ShieldIcon from '@suid/icons-material/Shield'
import SmartToyIcon from '@suid/icons-material/SmartToy'
import FolderOpenIcon from '@suid/icons-material/FolderOpen'
import DeleteOutlineIcon from '@suid/icons-material/DeleteOutline'
import SendIcon from '@suid/icons-material/Send'
import { Show, createSignal, mapArray, onMount } from 'solid-js'
import { useNavigate } from '@solidjs/router'

import API from '../../api'
import { convertSize } from '../../common/size_converter'
import { alertStore } from '../../components/AlertStack'
import ActionConfirmDialog from '../../components/ActionConfirmDialog'
import OnboardingVaultDialog from '../../components/OnboardingVaultDialog'

const Storages = () => {
	const { addAlert } = alertStore
	const [storages, setStorages] = createSignal([])
	const [selectedStorageToDelete, setSelectedStorageToDelete] = createSignal(null)
	const [onboardingOpen, setOnboardingOpen] = createSignal(false)
	const navigate = useNavigate()

	const fetchStorages = async () => {
		try {
			const res = await API.storages.listStorages()
			const list = res.storages || []
			setStorages(list)
			// Automatically prompt onboarding popup if 0 storage vaults exist
			if (list.length === 0) {
				setOnboardingOpen(true)
			}
		} catch (err) {
			console.error(err)
		}
	}

	onMount(fetchStorages)

	const totalSize = () => storages().reduce((acc, s) => acc + (s.size || 0), 0)
	const totalFiles = () => storages().reduce((acc, s) => acc + (s.files_amount || 0), 0)
	const totalChunks = () => storages().reduce((acc, s) => acc + (s.chunks_count || s.files_amount || 0), 0)

	const confirmDeleteStorage = async () => {
		const target = selectedStorageToDelete()
		if (!target) return
		try {
			await API.storages.deleteStorage(target.id)
			addAlert(`Deleted storage "${target.name}"`, 'success')
			setSelectedStorageToDelete(null)
			await fetchStorages()
		} catch (err) {
			console.error(err)
		}
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
						variant="h4"
						sx={{
							fontWeight: 800,
							letterSpacing: '-0.02em',
							color: '#f8fafc',
						}}
					>
						Storage Vaults
					</Typography>
					<Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5 }}>
						Distributed, encrypted cloud storage clusters backed by Telegram Bot MTProto nodes.
					</Typography>
				</Box>

				<Button
					onClick={() => navigate('/storages/register')}
					variant="contained"
					startIcon={<AddIcon />}
					sx={{
						background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
						color: 'white',
						textTransform: 'none',
						fontWeight: 700,
						borderRadius: 2,
						px: 2.5,
						py: 1,
						boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
					}}
				>
					New Storage Vault
				</Button>
			</Box>

			{/* Metric Cards */}
			<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
				<Paper
					sx={{
						p: 2.5,
						borderRadius: 2.5,
						backgroundColor: 'rgba(255, 255, 255, 0.03)',
						border: '1px solid rgba(255, 255, 255, 0.06)',
					}}
				>
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
						<Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
							Total Vaults
						</Typography>
						<StorageIcon sx={{ color: '#818cf8', fontSize: 20 }} />
					</Box>
					<Typography variant="h5" sx={{ fontWeight: 800, color: '#f8fafc' }}>
						{storages().length}
					</Typography>
				</Paper>

				<Paper
					sx={{
						p: 2.5,
						borderRadius: 2.5,
						backgroundColor: 'rgba(255, 255, 255, 0.03)',
						border: '1px solid rgba(255, 255, 255, 0.06)',
					}}
				>
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
						<Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
							Encrypted Size
						</Typography>
						<ShieldIcon sx={{ color: '#10b981', fontSize: 20 }} />
					</Box>
					<Typography variant="h5" sx={{ fontWeight: 800, color: '#10b981' }}>
						{convertSize(totalSize())}
					</Typography>
				</Paper>

				<Paper
					sx={{
						p: 2.5,
						borderRadius: 2.5,
						backgroundColor: 'rgba(255, 255, 255, 0.03)',
						border: '1px solid rgba(255, 255, 255, 0.06)',
					}}
				>
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
						<Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
							Files / Chunks
						</Typography>
						<SmartToyIcon sx={{ color: '#38bdf8', fontSize: 20 }} />
					</Box>
					<Typography variant="h5" sx={{ fontWeight: 800, color: '#38bdf8' }}>
						{totalFiles()} <span style={{ 'font-size': '14px', color: '#94a3b8', 'font-weight': 500 }}>({totalChunks()} chunks)</span>
					</Typography>
				</Paper>

				<Paper
					sx={{
						p: 2.5,
						borderRadius: 2.5,
						backgroundColor: 'rgba(255, 255, 255, 0.03)',
						border: '1px solid rgba(255, 255, 255, 0.06)',
					}}
				>
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
						<Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
							Encryption Standard
						</Typography>
						<ShieldIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
					</Box>
					<Typography variant="h6" sx={{ fontWeight: 800, color: '#f59e0b', fontSize: '1.1rem' }}>
						AES-256-GCM
					</Typography>
				</Paper>
			</Box>

			{/* Storages Table Container */}
			<Paper
				sx={{
					borderRadius: 3,
					backgroundColor: '#0d1527',
					border: '1px solid rgba(255, 255, 255, 0.08)',
					overflow: 'hidden',
				}}
			>
				<TableContainer>
					<Table sx={{ minWidth: 650 }}>
						<Show
							when={storages().length > 0}
							fallback={
								<Box sx={{ p: 6, textAlign: 'center' }}>
									<StorageIcon sx={{ fontSize: 48, color: '#475569', mb: 1.5 }} />
									<Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: 600 }}>
										No Storage Vaults Registered Yet
									</Typography>
									<Typography variant="body2" sx={{ color: '#94a3b8', mb: 3, maxWidth: 420, mx: 'auto' }}>
										Create a Telegram Channel, add your bot as an admin, and register your first storage vault to start uploading encrypted files.
									</Typography>
									<Button
										onClick={() => navigate('/storages/register')}
										variant="contained"
										sx={{ background: '#6366f1', textTransform: 'none', fontWeight: 600 }}
									>
										Register First Vault
									</Button>
								</Box>
							}
						>
							<TableHead>
								<TableRow sx={{ '& th': { backgroundColor: '#131e36', color: '#94a3b8', fontWeight: 700, borderColor: 'rgba(255,255,255,0.06)' } }}>
									<TableCell>Storage Vault Name</TableCell>
									<TableCell>Telegram Chat ID</TableCell>
									<TableCell>Encrypted Size</TableCell>
									<TableCell>Files / Chunks</TableCell>
									<TableCell>Security</TableCell>
									<TableCell align="right">Actions</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{mapArray(storages, (storage) => (
									<TableRow
										sx={{
											cursor: 'pointer',
											transition: 'all 0.15s ease',
											'&:hover': { backgroundColor: 'rgba(99, 102, 241, 0.08)' },
											'& td': { color: '#cbd5e1', borderColor: 'rgba(255,255,255,0.05)', py: 2 },
										}}
									>
										<TableCell
											component="th"
											scope="row"
											onClick={() => navigate(`/storages/${storage.id}/files`)}
											sx={{ fontWeight: 700, color: '#f8fafc !important' }}
										>
											<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
												<Box
													sx={{
														width: 32,
														height: 32,
														borderRadius: 1.5,
														backgroundColor: 'rgba(99, 102, 241, 0.15)',
														display: 'flex',
														alignItems: 'center',
														justifyContent: 'center',
														color: '#818cf8',
													}}
												>
													<StorageIcon fontSize="small" />
												</Box>
												<span>{storage.name}</span>
											</Box>
										</TableCell>
										<TableCell onClick={() => navigate(`/storages/${storage.id}/files`)}>
											<Chip
												icon={<SendIcon sx={{ fontSize: '13px !important', color: '#38bdf8 !important' }} />}
												label={String(storage.chat_id)}
												size="small"
												sx={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', fontFamily: 'monospace', fontWeight: 600 }}
											/>
										</TableCell>
										<TableCell onClick={() => navigate(`/storages/${storage.id}/files`)}>
											{convertSize(storage.size)}
										</TableCell>
										<TableCell onClick={() => navigate(`/storages/${storage.id}/files`)}>
											{storage.files_amount} files ({storage.chunks_count || storage.files_amount} chunks)
										</TableCell>
										<TableCell onClick={() => navigate(`/storages/${storage.id}/files`)}>
											<Chip
												icon={<ShieldIcon sx={{ fontSize: '13px !important', color: '#10b981 !important' }} />}
												label="AES-256-GCM"
												size="small"
												sx={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', fontWeight: 700, fontSize: 11 }}
											/>
										</TableCell>
										<TableCell align="right">
											<Button
												size="small"
												variant="outlined"
												startIcon={<FolderOpenIcon />}
												onClick={() => navigate(`/storages/${storage.id}/files`)}
												sx={{
													color: '#818cf8',
													borderColor: 'rgba(99, 102, 241, 0.3)',
													textTransform: 'none',
													fontSize: 12,
													fontWeight: 600,
													mr: 1,
												}}
											>
												Browse
											</Button>
											<IconButton
												size="small"
												onClick={(e) => {
													e.stopPropagation()
													setSelectedStorageToDelete(storage)
												}}
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
				entity="storage vault"
				actionDescription={`permanently delete vault "${selectedStorageToDelete()?.name}" and all its chunk metadata`}
				isOpened={Boolean(selectedStorageToDelete())}
				onConfirm={confirmDeleteStorage}
				onCancel={() => setSelectedStorageToDelete(null)}
			/>

			<OnboardingVaultDialog
				open={onboardingOpen()}
				onClose={() => setOnboardingOpen(false)}
				onCreated={() => fetchStorages()}
			/>
		</Box>
	)
}

export default Storages
