import ListItem from '@suid/material/ListItem'
import ListItemButton from '@suid/material/ListItemButton'
import ListItemIcon from '@suid/material/ListItemIcon'
import ListItemText from '@suid/material/ListItemText'
import MenuMUI from '@suid/material/Menu'
import MenuItem from '@suid/material/MenuItem'
import IconButton from '@suid/material/IconButton'
import Chip from '@suid/material/Chip'
import Typography from '@suid/material/Typography'
import Box from '@suid/material/Box'
import Dialog from '@suid/material/Dialog'
import DialogContent from '@suid/material/DialogContent'
import FileIcon from '@suid/icons-material/InsertDriveFileOutlined'
import FolderIcon from '@suid/icons-material/Folder'
import MoreVertIcon from '@suid/icons-material/MoreVert'
import DownloadIcon from '@suid/icons-material/Download'
import InfoIcon from '@suid/icons-material/Info'
import DeleteIcon from '@suid/icons-material/Delete'
import ShieldIcon from '@suid/icons-material/Shield'
import LockIcon from '@suid/icons-material/Lock'
import CloseIcon from '@suid/icons-material/Close'
import { Show, createSignal } from 'solid-js'
import { useNavigate, useParams } from '@solidjs/router'

import API from '../api'
import ActionConfirmDialog from './ActionConfirmDialog'
import FileInfoDialog from './FileInfo'
import { alertStore } from './AlertStack'
import { convertSize } from '../common/size_converter'
import uploadManager from '../common/uploadManager'
import createLocalStore from '../../libs'

/**
 * @typedef {Object} FSListItemProps
 * @property {import("../api").FSElement} fsElement
 * @property {string} storageId
 * @property {() => {}} onDelete
 * @property {(fileName: string) => void} [onDownloadStart]
 * @property {(progress: number) => void} [onDownloadProgress]
 * @property {() => void} [onDownloadEnd]
 */

/**
 * @param {FSListItemProps} props
 */
const FSListItem = (props) => {
	const [store] = createLocalStore()
	const isAdmin = () => store.user?.role === 'admin'
	const [moreAnchorEl, setMoreAnchorEl] = createSignal(null)
	const [isActionConfirmDialogOpened, setIsActionConfirmDialogOpened] = createSignal(false)
	const [isInfoDialogOpened, setIsInfoDialogOpened] = createSignal(false)
	const [isMediaPreviewOpened, setIsMediaPreviewOpened] = createSignal(false)
	const [mediaLoading, setMediaLoading] = createSignal(true)
	const [mediaError, setMediaError] = createSignal(false)
	const [previewKey, setPreviewKey] = createSignal(0)
	const navigate = useNavigate()
	const params = useParams()
	const activeStorageId = () => props.storageId || params.id
	const mediaKind = () => {
		const name = (props.fsElement.name || '').toLowerCase()
		if (/\.(avif|bmp|gif|jpe?g|png|svg|webp|ico)$/.test(name)) return 'image'
		if (/\.(m4v|mov|mp4|ogg|ogv|webm|mkv|avi)$/.test(name)) return 'video'
		if (/\.(mp3|wav|flac|aac|m4a|oga|opus)$/.test(name)) return 'audio'
		return null
	}
	const mediaUrl = () => {
		const base = API.files.getMediaUrl(activeStorageId(), props.fsElement.path)
		return previewKey() > 0 ? `${base}&_k=${previewKey()}` : base
	}

	const retryMediaStream = () => {
		setMediaError(false)
		setMediaLoading(true)
		setPreviewKey((k) => k + 1)
	}

	const openMore = () => Boolean(moreAnchorEl())

	const handleCloseMore = () => {
		setMoreAnchorEl(null)
	}

	const handleNavigate = () => {
		if (!props.fsElement.is_file) {
			navigate(`/storages/${activeStorageId()}/files/${props.fsElement.path}`)
		} else if (mediaKind()) {
			setMediaLoading(true)
			setMediaError(false)
			setIsMediaPreviewOpened(true)
		}
	}

	const download = async () => {
		try {
			handleCloseMore()
			let filePath = props.fsElement.path
			if (props.fsElement.is_file && filePath.endsWith('/')) {
				filePath = filePath.slice(0, -1)
			}

			if (props.onDownloadStart) {
				props.onDownloadStart(props.fsElement.name)
			}

			await uploadManager.startDownload(
				activeStorageId(),
				filePath,
				props.fsElement.name,
				props.fsElement.size || 0
			)

			if (props.onDownloadProgress) {
				props.onDownloadProgress(100)
			}

			if (props.onDownloadEnd) {
				props.onDownloadEnd()
			}
		} catch (err) {
			console.error('Download error:', err)
			alertStore.addAlert(`Failed to download "${props.fsElement.name}": ${err.message}`, 'error')
			if (props.onDownloadEnd) props.onDownloadEnd()
		}
	}

	const openActionConfirmDialog = () => {
		handleCloseMore()
		setIsActionConfirmDialogOpened(true)
	}

	const closeActionConfirmDialog = () => {
		setIsActionConfirmDialogOpened(false)
	}

	const deleteFile = async () => {
		closeActionConfirmDialog()
		try {
			let path = props.fsElement.path
			if (!props.fsElement.is_file && !path.endsWith('/')) {
				path = path + '/'
			}
			await API.files.deleteFile(activeStorageId(), path)
			alertStore.addAlert(`Deleted "${props.fsElement.name}"`, 'success')
			props.onDelete()
		} catch (err) {
			console.error('Delete error:', err)
			alertStore.addAlert(err.message || 'Failed to delete', 'error')
		}
	}

	return (
		<>
			<ListItem
				disablePadding
				sx={{
					mb: 1,
					borderRadius: 2,
					backgroundColor: 'rgba(255, 255, 255, 0.03)',
					border: '1px solid rgba(255, 255, 255, 0.05)',
					transition: 'all 0.2s ease',
					'&:hover': {
						backgroundColor: 'rgba(99, 102, 241, 0.08)',
						borderColor: 'rgba(99, 102, 241, 0.2)',
						transform: 'translateY(-1px)',
					},
				}}
			>
				<ListItemButton
					onClick={handleNavigate}
					sx={{
						py: 1.2,
						px: 2,
						borderRadius: 2,
					}}
				>
					<ListItemIcon sx={{ minWidth: 44 }}>
						<Box
							sx={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								width: 36,
								height: 36,
								borderRadius: 2,
								backgroundColor: props.fsElement.is_file
									? 'rgba(99, 102, 241, 0.12)'
									: 'rgba(245, 158, 11, 0.12)',
								color: props.fsElement.is_file ? '#818cf8' : '#fbbf24',
							}}
						>
							<Show when={props.fsElement.is_file} fallback={<FolderIcon sx={{ fontSize: 20 }} />}>
								<FileIcon sx={{ fontSize: 20 }} />
							</Show>
						</Box>
					</ListItemIcon>

					<ListItemText
						primary={props.fsElement.name}
						secondary={
							props.fsElement.is_file
								? `${convertSize(props.fsElement.size)} • ${props.fsElement.chunks_count || 1} encrypted chunks (AES-256-GCM)`
								: 'Directory'
						}
						primaryTypographyProps={{
							sx: {
								fontWeight: props.fsElement.is_file ? 500 : 600,
								color: 'text.primary',
								fontSize: '0.95rem',
							},
						}}
						secondaryTypographyProps={{
							sx: {
								color: 'text.secondary',
								fontSize: '0.75rem',
								mt: 0.25,
							},
						}}
					/>

					{/* Badges */}
					<Show when={props.fsElement.is_file}>
						<Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1, mr: 2 }}>
							<Chip
								label={`${props.fsElement.chunks_count || 1} Chunks`}
								size="small"
								sx={{
									bgcolor: 'action.hover',
									color: 'text.secondary',
									fontWeight: 600,
									fontSize: 11,
									height: 22,
									border: '1px solid',
									borderColor: 'divider',
								}}
							/>
							<Chip
								icon={<ShieldIcon sx={{ fontSize: '13px !important', color: 'success.main !important' }} />}
								label="Encrypted"
								size="small"
								sx={{
									bgcolor: 'action.hover',
									color: 'success.main',
									fontWeight: 600,
									fontSize: 11,
									height: 22,
									border: '1px solid',
									borderColor: 'divider',
								}}
							/>
						</Box>
					</Show>
				</ListItemButton>

				{/* Quick Actions */}
				<Box sx={{ display: 'flex', alignItems: 'center', pr: 1.5 }}>
					<Show when={props.fsElement.is_file}>
						<IconButton
							size="small"
							onClick={() => setIsInfoDialogOpened(true)}
							title="View Encrypted Chunks & Security Info"
							sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: 'action.hover' } }}
						>
							<InfoIcon fontSize="small" />
						</IconButton>
						<IconButton
							size="small"
							onClick={download}
							title="Decrypt & Download"
							sx={{ color: 'text.secondary', '&:hover': { color: 'success.main', bgcolor: 'action.hover' } }}
						>
							<DownloadIcon fontSize="small" />
						</IconButton>
					</Show>

					<IconButton
						size="small"
						onClick={(event) => setMoreAnchorEl(event.currentTarget)}
						sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
					>
						<MoreVertIcon fontSize="small" />
					</IconButton>
				</Box>
			</ListItem>

			<MenuMUI
				id="file-action-menu"
				anchorEl={moreAnchorEl()}
				open={openMore()}
				onClose={handleCloseMore}
				PaperProps={{
					sx: {
						bgcolor: 'background.paper',
						color: 'text.primary',
						border: '1px solid',
						borderColor: 'divider',
						borderRadius: '10px',
					},
				}}
			>
				<Show when={props.fsElement.is_file}>
					<MenuItem
						onClick={() => {
							handleCloseMore()
							setIsInfoDialogOpened(true)
						}}
					>
						<ListItemIcon sx={{ color: 'primary.main' }}>
							<InfoIcon fontSize="small" />
						</ListItemIcon>
						<ListItemText>AES-256 Chunk Inspector</ListItemText>
					</MenuItem>

					<MenuItem onClick={download}>
						<ListItemIcon sx={{ color: 'success.main' }}>
							<DownloadIcon fontSize="small" />
						</ListItemIcon>
						<ListItemText>Decrypt & Download</ListItemText>
					</MenuItem>
				</Show>

				<Show when={isAdmin()}>
					<MenuItem onClick={openActionConfirmDialog} sx={{ color: 'error.main' }}>
						<ListItemIcon sx={{ color: 'error.main' }}>
							<DeleteIcon fontSize="small" />
						</ListItemIcon>
						<ListItemText>Delete</ListItemText>
					</MenuItem>
				</Show>
			</MenuMUI>

			<Show when={isAdmin()}>
				<ActionConfirmDialog
					action="Delete"
					entity="file"
					actionDescription={`delete ${props.fsElement.name}`}
					isOpened={isActionConfirmDialogOpened()}
					onConfirm={deleteFile}
					onCancel={closeActionConfirmDialog}
				/>
			</Show>

			<FileInfoDialog
				file={props.fsElement}
				storageId={activeStorageId()}
				isOpened={isInfoDialogOpened()}
				onClose={() => setIsInfoDialogOpened(false)}
				onDownload={props.fsElement.is_file ? download : undefined}
			/>

			<Dialog
				open={isMediaPreviewOpened()}
				onClose={() => setIsMediaPreviewOpened(false)}
				maxWidth="lg"
				fullWidth
				PaperProps={{
					sx: {
						backgroundColor: 'background.paper',
						color: 'text.primary',
						borderRadius: '12px',
						border: '1px solid',
						borderColor: 'divider',
						overflow: 'hidden',
					},
				}}
			>
				<Box
					sx={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						px: 2.5,
						py: 1.5,
						borderBottom: '1px solid',
						borderColor: 'divider',
					}}
				>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
						<Chip
							label={props.fsElement.size ? convertSize(props.fsElement.size) : 'Media'}
							size="small"
							sx={{ height: '22px', fontSize: '0.72rem', fontWeight: 600, bgcolor: 'action.hover' }}
						/>
						<Typography noWrap sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
							{props.fsElement.name}
						</Typography>
					</Box>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<Button
							size="small"
							startIcon={<DownloadIcon />}
							onClick={download}
							sx={{ textTransform: 'none', fontSize: '0.8rem' }}
						>
							Download
						</Button>
						<IconButton aria-label="Close preview" onClick={() => setIsMediaPreviewOpened(false)} size="small">
							<CloseIcon fontSize="small" />
						</IconButton>
					</Box>
				</Box>

				<DialogContent
					sx={{
						p: 0,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						minHeight: '280px',
						bgcolor: '#000000',
						position: 'relative',
					}}
				>
					<Show when={mediaError()}>
						<Box sx={{ p: 4, textAlign: 'center', color: '#f8fafc' }}>
							<Typography sx={{ mb: 1, fontWeight: 600 }}>Media Stream Disconnected</Typography>
							<Typography variant="body2" sx={{ color: '#94a3b8', mb: 2 }}>
								Could not stream real-time chunks. The server may have reconnected.
							</Typography>
							<Button variant="contained" size="small" onClick={retryMediaStream}>
								Retry Streaming
							</Button>
						</Box>
					</Show>

					<Show when={!mediaError() && mediaKind() === 'image'}>
						<img
							src={mediaUrl()}
							alt={props.fsElement.name}
							onLoad={() => setMediaLoading(false)}
							onError={() => {
								setMediaLoading(false)
								setMediaError(true)
							}}
							style={{
								display: 'block',
								'max-width': '100%',
								'max-height': '80vh',
								'object-fit': 'contain',
							}}
						/>
					</Show>

					<Show when={!mediaError() && mediaKind() === 'video'}>
						<video
							src={mediaUrl()}
							controls
							autoplay
							playsinline
							preload="metadata"
							onCanPlay={() => setMediaLoading(false)}
							onError={() => {
								setMediaLoading(false)
								setMediaError(true)
							}}
							style={{
								display: 'block',
								width: '100%',
								'max-height': '80vh',
								background: '#000',
							}}
						/>
					</Show>

					<Show when={!mediaError() && mediaKind() === 'audio'}>
						<Box sx={{ p: 4, width: '100%', maxWidth: 500, textAlign: 'center' }}>
							<audio
								src={mediaUrl()}
								controls
								autoplay
								onCanPlay={() => setMediaLoading(false)}
								onError={() => {
									setMediaLoading(false)
									setMediaError(true)
								}}
								style={{ width: '100%' }}
							/>
						</Box>
					</Show>
				</DialogContent>
			</Dialog>
		</>
	)
}

export default FSListItem
