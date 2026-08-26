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
import Button from '@suid/material/Button'
import Dialog from '@suid/material/Dialog'
import DialogContent from '@suid/material/DialogContent'
import CircularProgress from '@suid/material/CircularProgress'
import FileIcon from '@suid/icons-material/InsertDriveFileOutlined'
import FolderIcon from '@suid/icons-material/Folder'
import MoreVertIcon from '@suid/icons-material/MoreVert'
import DownloadIcon from '@suid/icons-material/Download'
import InfoIcon from '@suid/icons-material/Info'
import DeleteIcon from '@suid/icons-material/Delete'
import ShieldIcon from '@suid/icons-material/Shield'
import LockIcon from '@suid/icons-material/Lock'
import CloseIcon from '@suid/icons-material/Close'
import RefreshIcon from '@suid/icons-material/Refresh'
import { Show, createSignal, createEffect } from 'solid-js'
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
	const [blobMediaUrl, setBlobMediaUrl] = createSignal('')
	const [isBufferingBlob, setIsBufferingBlob] = createSignal(false)
	const [textContent, setTextContent] = createSignal('')
	const [textLoading, setTextLoading] = createSignal(false)
	const navigate = useNavigate()
	const params = useParams()
	const activeStorageId = () => props.storageId || params.id

	const mediaKind = () => {
		const name = (props.fsElement.name || '').toLowerCase()
		if (/\.(avif|bmp|gif|jpe?g|png|svg|webp|ico|tif|tiff)$/.test(name)) return 'image'
		if (/\.(m4v|mov|mp4|ogg|ogv|webm|mkv|avi|wmv|flv|ts)$/.test(name)) return 'video'
		if (/\.(mp3|wav|flac|aac|m4a|oga|opus|weba)$/.test(name)) return 'audio'
		if (/\.(pdf)$/.test(name)) return 'pdf'
		if (/\.(txt|json|js|jsx|ts|tsx|html|css|scss|md|markdown|log|csv|xml|yml|yaml|env|py|sh|sql|c|cpp|h|rs|go|toml|ini)$/.test(name)) return 'text'
		return 'other'
	}

	const mediaUrl = () => {
		if (blobMediaUrl()) return blobMediaUrl()
		const base = API.files.getMediaUrl(activeStorageId(), props.fsElement.path)
		return previewKey() > 0 ? `${base}&_k=${previewKey()}` : base
	}

	const loadBlobFallback = async () => {
		if (isBufferingBlob()) return
		setIsBufferingBlob(true)
		setMediaLoading(true)
		setMediaError(false)
		try {
			const blob = await API.files.download(activeStorageId(), props.fsElement.path)
			if (blob && blob.size > 0) {
				const mime = props.fsElement.mimeType || (mediaKind() === 'video' ? 'video/mp4' : 'application/octet-stream')
				const typedBlob = blob.type ? blob : new Blob([blob], { type: mime })
				const url = URL.createObjectURL(typedBlob)
				if (blobMediaUrl()) URL.revokeObjectURL(blobMediaUrl())
				setBlobMediaUrl(url)
				setMediaError(false)
			} else {
				throw new Error('Empty file')
			}
		} catch (err) {
			console.warn('In-memory playback buffer failed:', err)
			setMediaError(true)
		} finally {
			setIsBufferingBlob(false)
			setMediaLoading(false)
		}
	}

	const handleMediaError = (e) => {
		console.warn('Native media streaming notice:', e)
		setMediaLoading(false)
		setMediaError(true)
	}

	const retryMediaStream = () => {
		if (blobMediaUrl()) {
			URL.revokeObjectURL(blobMediaUrl())
			setBlobMediaUrl('')
		}
		setMediaError(false)
		setMediaLoading(true)
		setPreviewKey((k) => k + 1)
	}

	const handleCloseMediaPreview = () => {
		setIsMediaPreviewOpened(false)
		if (blobMediaUrl()) {
			URL.revokeObjectURL(blobMediaUrl())
			setBlobMediaUrl('')
		}
	}

	// Fetch text preview when text file modal is opened
	createEffect(async () => {
		if (isMediaPreviewOpened() && mediaKind() === 'text' && props.fsElement.is_file) {
			setTextLoading(true)
			setTextContent('')
			try {
				const blob = await API.files.download(activeStorageId(), props.fsElement.path)
				const text = await blob.text()
				setTextContent(text)
				setMediaLoading(false)
			} catch (err) {
				console.error('Failed to load text preview:', err)
				setMediaError(true)
				setMediaLoading(false)
			} finally {
				setTextLoading(false)
			}
		}
	})

	const openMore = () => Boolean(moreAnchorEl())

	const handleCloseMore = () => {
		setMoreAnchorEl(null)
	}

	const handleNavigate = () => {
		if (!props.fsElement.is_file) {
			navigate(`/storages/${activeStorageId()}/files/${props.fsElement.path}`)
		} else {
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

			{/* Universal Interactive File Preview & Media Stream Modal */}
			<Dialog
				open={isMediaPreviewOpened()}
				onClose={handleCloseMediaPreview}
				maxWidth="lg"
				fullWidth
				PaperProps={{
					sx: {
						backgroundColor: 'background.paper',
						color: 'text.primary',
						borderRadius: '14px',
						border: '1px solid',
						borderColor: 'divider',
						overflow: 'hidden',
						boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
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
						bgcolor: 'rgba(255, 255, 255, 0.02)',
					}}
				>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
						<Chip
							label={props.fsElement.size ? convertSize(props.fsElement.size) : 'File'}
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
							startIcon={<InfoIcon />}
							onClick={() => {
								handleCloseMediaPreview()
								setIsInfoDialogOpened(true)
							}}
							sx={{ textTransform: 'none', fontSize: '0.8rem', color: 'text.secondary' }}
						>
							Chunks
						</Button>
						<Button
							size="small"
							variant="contained"
							startIcon={<DownloadIcon />}
							onClick={download}
							sx={{ textTransform: 'none', fontSize: '0.8rem', bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' } }}
						>
							Decrypt & Download
						</Button>
						<IconButton aria-label="Close preview" onClick={handleCloseMediaPreview} size="small">
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
						minHeight: '320px',
						bgcolor: '#0a0d14',
						position: 'relative',
					}}
				>
					{/* Loading Spinner */}
					<Show when={mediaLoading() && !mediaError() && mediaKind() !== 'text' && mediaKind() !== 'other'}>
						<Box sx={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, zIndex: 2 }}>
							<CircularProgress size={36} sx={{ color: 'primary.main' }} />
							<Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>
								{isBufferingBlob() ? 'Decrypting full file buffer for smooth playback...' : 'Decrypting and streaming AES-256 slices...'}
							</Typography>
						</Box>
					</Show>

					{/* Error State */}
					<Show when={mediaError()}>
						<Box sx={{ p: 4, textAlign: 'center', color: '#f8fafc' }}>
							<Typography sx={{ mb: 1, fontWeight: 600, fontSize: '1.1rem' }}>Media Stream Notice</Typography>
							<Typography variant="body2" sx={{ color: '#94a3b8', mb: 2.5, maxWidth: 460 }}>
								Browser was unable to play the direct stream with current hardware/codec capabilities. You can load it into an in-browser decrypted buffer or download the file directly.
							</Typography>
							<Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
								<Button variant="outlined" size="small" startIcon={<RefreshIcon />} onClick={retryMediaStream} sx={{ textTransform: 'none' }}>
									Retry Stream
								</Button>
								<Button variant="outlined" color="primary" size="small" onClick={loadBlobFallback} sx={{ textTransform: 'none' }}>
									Play via Memory Buffer
								</Button>
								<Button variant="contained" color="success" size="small" startIcon={<DownloadIcon />} onClick={download} sx={{ textTransform: 'none' }}>
									Decrypt & Download File
								</Button>
							</Box>
						</Box>
					</Show>

					{/* Image Preview */}
					<Show when={!mediaError() && mediaKind() === 'image'}>
						<Box sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', maxHeight: '82vh' }}>
							<img
								src={mediaUrl()}
								alt={props.fsElement.name}
								onLoad={() => setMediaLoading(false)}
								onError={handleMediaError}
								style={{
									display: 'block',
									'max-width': '100%',
									'max-height': '78vh',
									'object-fit': 'contain',
									'border-radius': '8px',
								}}
							/>
						</Box>
					</Show>

					{/* Video Player */}
					<Show when={!mediaError() && mediaKind() === 'video'}>
						<Box sx={{ width: '100%', maxHeight: '82vh', bgcolor: '#000' }}>
							<video
								src={mediaUrl()}
								controls
								playsinline
								preload="auto"
								crossOrigin="anonymous"
								onCanPlay={() => setMediaLoading(false)}
								onCanPlayThrough={() => setMediaLoading(false)}
								onLoadedData={() => setMediaLoading(false)}
								onPlaying={() => setMediaLoading(false)}
								onLoadedMetadata={() => setMediaLoading(false)}
								onError={handleMediaError}
								style={{
									display: 'block',
									width: '100%',
									'max-height': '78vh',
									background: '#000',
								}}
							/>
						</Box>
					</Show>

					{/* Audio Player */}
					<Show when={!mediaError() && mediaKind() === 'audio'}>
						<Box sx={{ p: 5, width: '100%', maxWidth: 520, textAlign: 'center' }}>
							<Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: 'rgba(99, 102, 241, 0.15)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', mb: 2, color: 'primary.main' }}>
								<FileIcon sx={{ fontSize: 32 }} />
							</Box>
							<Typography sx={{ fontWeight: 600, mb: 0.5, color: '#f8fafc' }}>{props.fsElement.name}</Typography>
							<Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
								{convertSize(props.fsElement.size)} • Encrypted Audio Stream
							</Typography>
							<audio
								src={mediaUrl()}
								controls
								preload="auto"
								onCanPlay={() => setMediaLoading(false)}
								onCanPlayThrough={() => setMediaLoading(false)}
								onLoadedData={() => setMediaLoading(false)}
								onPlaying={() => setMediaLoading(false)}
								onError={handleMediaError}
								style={{ width: '100%' }}
							/>
						</Box>
					</Show>

					{/* Text / Code Preview */}
					<Show when={!mediaError() && mediaKind() === 'text'}>
						<Box sx={{ width: '100%', p: 2.5, maxHeight: '78vh', overflow: 'auto' }}>
							<Show when={textLoading()}>
								<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4, gap: 1.5 }}>
									<CircularProgress size={24} />
									<Typography variant="body2" sx={{ color: '#94a3b8' }}>Loading and decrypting text...</Typography>
								</Box>
							</Show>
							<Show when={!textLoading()}>
								<pre style={{
									margin: 0,
									padding: '16px',
									'background-color': '#111827',
									'border-radius': '8px',
									'font-family': 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
									'font-size': '0.85rem',
									color: '#e2e8f0',
									'white-space': 'pre-wrap',
									'word-break': 'break-word',
									border: '1px solid rgba(255,255,255,0.08)'
								}}>
									{textContent()}
								</pre>
							</Show>
						</Box>
					</Show>

					{/* PDF Preview */}
					<Show when={!mediaError() && mediaKind() === 'pdf'}>
						<Box sx={{ width: '100%', height: '78vh' }}>
							<iframe
								src={mediaUrl()}
								title={props.fsElement.name}
								onLoad={() => setMediaLoading(false)}
								onError={() => {
									setMediaLoading(false)
									setMediaError(true)
								}}
								style={{ width: '100%', height: '100%', border: 'none' }}
							/>
						</Box>
					</Show>

					{/* Generic / Binary File Card */}
					<Show when={!mediaError() && mediaKind() === 'other'}>
						<Box sx={{ p: 5, textAlign: 'center', maxWidth: 480 }}>
							<Box sx={{ width: 68, height: 68, borderRadius: '16px', bgcolor: 'rgba(99, 102, 241, 0.15)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', mb: 2.5, color: '#818cf8' }}>
								<LockIcon sx={{ fontSize: 34 }} />
							</Box>
							<Typography variant="h6" sx={{ fontWeight: 600, color: '#f8fafc', mb: 0.5 }}>
								{props.fsElement.name}
							</Typography>
							<Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
								{convertSize(props.fsElement.size)} • {props.fsElement.chunks_count || 1} Chunks • AES-256-GCM Encrypted
							</Typography>
							<Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}>
								<Button
									variant="outlined"
									startIcon={<InfoIcon />}
									onClick={() => {
										setIsMediaPreviewOpened(false)
										setIsInfoDialogOpened(true)
									}}
									sx={{ textTransform: 'none' }}
								>
									Inspect Chunks
								</Button>
								<Button
									variant="contained"
									color="success"
									startIcon={<DownloadIcon />}
									onClick={download}
									sx={{ textTransform: 'none' }}
								>
									Decrypt & Download
								</Button>
							</Box>
						</Box>
					</Show>
				</DialogContent>
			</Dialog>
		</>
	)
}

export default FSListItem
