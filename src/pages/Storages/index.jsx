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
import createLocalStore from '../../../libs'

const Storages = () => {
	const { addAlert } = alertStore
	const [store] = createLocalStore()
	const isAdmin = () => store.user?.role === 'admin'
	const [storages, setStorages] = createSignal([])
	const [selectedStorageToDelete, setSelectedStorageToDelete] = createSignal(null)
	const [onboardingOpen, setOnboardingOpen] = createSignal(false)
	const navigate = useNavigate()

	const fetchStorages = async () => {
		try {
			const res = await API.storages.listStorages()
			const list = res.storages || []
			setStorages(list)
			// Automatically prompt onboarding popup if 0 storage vaults exist and user is admin
			if (list.length === 0 && isAdmin()) {
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
						variant="h5"
						sx={{
							fontWeight: 700,
							letterSpacing: '-0.02em',
							color: 'text.primary',
						}}
					>
						Storage Vaults
					</Typography>
					<Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
						Distributed, encrypted cloud storage clusters backed by Telegram Bot MTProto nodes.
					</Typography>
				</Box>

				<Show when={isAdmin()}>
					<Button
						onClick={() => navigate('/storages/register')}
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
						New Storage Vault
					</Button>
				</Show>
			</Box>

			{/* Metric Cards */}
			<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
				<Paper
					sx={{
						p: 2,
						borderRadius: '10px',
						bgcolor: 'background.paper',
						border: '1px solid',
						borderColor: 'divider',
					}}
				>
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
						<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
							Total Vaults
						</Typography>
						<StorageIcon sx={{ color: 'primary.main', fontSize: 18 }} />
					</Box>
					<Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
						{storages().length}
					</Typography>
				</Paper>

				<Paper
					sx={{
						p: 2,
						borderRadius: '10px',
						bgcolor: 'background.paper',
						border: '1px solid',
						borderColor: 'divider',
					}}
				>
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
						<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
							Encrypted Size
						</Typography>
						<ShieldIcon sx={{ color: 'success.main', fontSize: 18 }} />
					</Box>
					<Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
						{convertSize(totalSize())}
					</Typography>
				</Paper>

				<Paper
					sx={{
						p: 2,
						borderRadius: '10px',
						bgcolor: 'background.paper',
						border: '1px solid',
						borderColor: 'divider',
					}}
				>
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
						<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
							Files / Chunks
						</Typography>
						<SmartToyIcon sx={{ color: 'secondary.main', fontSize: 18 }} />
					</Box>
					<Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
						{totalFiles()} <span style={{ 'font-size': '12px', color: 'var(--text-secondary, #94a3b8)', 'font-weight': 400 }}>({totalChunks()} chunks)</span>
					</Typography>
				</Paper>

				<Paper
					sx={{
						p: 2,
						borderRadius: '10px',
						bgcolor: 'background.paper',
						border: '1px solid',
						borderColor: 'divider',
					}}
				>
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
						<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
							Encryption Standard
						</Typography>
						<ShieldIcon sx={{ color: 'warning.main', fontSize: 18 }} />
					</Box>
					<Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'warning.main' }}>
						AES-256-GCM
					</Typography>
				</Paper>
			</Box>

			{/* Storages Table Container */}
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
							when={storages().length > 0}
							fallback={
								<Box sx={{ p: 6, textAlign: 'center' }}>
									<StorageIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
									<Typography variant="subtitle1" sx={{ color: 'text.primary', fontWeight: 600 }}>
										{isAdmin() ? 'No Storage Vaults Registered Yet' : 'No Storage Vaults Available'}
									</Typography>
									<Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5, maxWidth: 420, mx: 'auto' }}>
										{isAdmin()
											? 'Create a Telegram Channel, add your bot as an admin, and register your first storage vault to start uploading encrypted files.'
											: 'There are currently no storage vaults configured. Please contact your system administrator to assign or register a vault.'}
									</Typography>
									<Show when={isAdmin()}>
										<Button
											onClick={() => navigate('/storages/register')}
											variant="contained"
											size="small"
											sx={{ textTransform: 'none', fontWeight: 600 }}
										>
											Register First Vault
										</Button>
									</Show>
								</Box>
							}
						>
							<TableHead>
								<TableRow sx={{ '& th': { bgcolor: 'action.hover', color: 'text.secondary', fontWeight: 600, borderColor: 'divider' } }}>
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
											'&:hover': { bgcolor: 'action.hover' },
											'& td': { color: 'text.primary', borderColor: 'divider', py: 1.5 },
										}}
									>
										<TableCell
											component="th"
											scope="row"
											onClick={() => navigate(`/storages/${storage.id}/files`)}
											sx={{ fontWeight: 600 }}
										>
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
													<StorageIcon fontSize="small" />
												</Box>
												<span>{storage.name}</span>
											</Box>
										</TableCell>
										<TableCell onClick={() => navigate(`/storages/${storage.id}/files`)}>
											<Chip
												icon={<SendIcon sx={{ fontSize: '12px !important', color: 'secondary.main !important' }} />}
												label={String(storage.chat_id)}
												size="small"
												sx={{ bgcolor: 'action.hover', color: 'secondary.main', fontFamily: 'monospace', fontWeight: 600, height: '22px' }}
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
												icon={<ShieldIcon sx={{ fontSize: '12px !important', color: 'success.main !important' }} />}
												label="AES-256-GCM"
												size="small"
												sx={{ bgcolor: 'action.hover', color: 'success.main', fontWeight: 600, fontSize: '0.72rem', height: '22px' }}
											/>
										</TableCell>
										<TableCell align="right">
											<Button
												size="small"
												variant="outlined"
												startIcon={<FolderOpenIcon />}
												onClick={() => navigate(`/storages/${storage.id}/files`)}
												sx={{
													textTransform: 'none',
													fontSize: '0.75rem',
													fontWeight: 600,
													mr: isAdmin() ? 1 : 0,
												}}
											>
												Browse
											</Button>
											<Show when={isAdmin()}>
												<IconButton
													size="small"
													onClick={(e) => {
														e.stopPropagation()
														setSelectedStorageToDelete(storage)
													}}
													sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
												>
													<DeleteOutlineIcon fontSize="small" />
												</IconButton>
											</Show>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Show>
					</Table>
				</TableContainer>
			</Paper>

			<Show when={isAdmin()}>
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
			</Show>
		</Box>
	)
}

export default Storages
