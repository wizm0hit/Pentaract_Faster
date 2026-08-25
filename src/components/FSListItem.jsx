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
import FileIcon from '@suid/icons-material/InsertDriveFileOutlined'
import FolderIcon from '@suid/icons-material/Folder'
import MoreVertIcon from '@suid/icons-material/MoreVert'
import DownloadIcon from '@suid/icons-material/Download'
import InfoIcon from '@suid/icons-material/Info'
import DeleteIcon from '@suid/icons-material/Delete'
import ShieldIcon from '@suid/icons-material/Shield'
import LockIcon from '@suid/icons-material/Lock'
import { Show, createSignal } from 'solid-js'
import { useNavigate, useParams } from '@solidjs/router'

import API from '../api'
import ActionConfirmDialog from './ActionConfirmDialog'
import FileInfoDialog from './FileInfo'
import { alertStore } from './AlertStack'
import { convertSize } from '../common/size_converter'

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
	const [moreAnchorEl, setMoreAnchorEl] = createSignal(null)
	const [isActionConfirmDialogOpened, setIsActionConfirmDialogOpened] = createSignal(false)
	const [isInfoDialogOpened, setIsInfoDialogOpened] = createSignal(false)
	const navigate = useNavigate()
	const params = useParams()
	const activeStorageId = () => props.storageId || params.id

	const openMore = () => Boolean(moreAnchorEl())

	const handleCloseMore = () => {
		setMoreAnchorEl(null)
	}

	const handleNavigate = () => {
		if (!props.fsElement.is_file) {
			navigate(`/storages/${activeStorageId()}/files/${props.fsElement.path}`)
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

			const blob = await API.files.download(
				activeStorageId(),
				filePath,
				props.onDownloadProgress || undefined
			)

			if (!blob || blob.size === 0) {
				if (props.onDownloadEnd) props.onDownloadEnd()
				return
			}

			const href = URL.createObjectURL(blob)
			const a = document.createElement('a')
			a.href = href
			a.download = props.fsElement.name
			a.style.display = 'none'
			document.body.appendChild(a)
			a.click()

			setTimeout(() => {
				if (document.body.contains(a)) document.body.removeChild(a)
				URL.revokeObjectURL(href)
			}, 250)

			if (props.onDownloadEnd) props.onDownloadEnd()
		} catch (err) {
			console.error('Download error:', err)
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
								fontWeight: props.fsElement.is_file ? 600 : 700,
								color: '#f8fafc',
								fontSize: '0.95rem',
							},
						}}
						secondaryTypographyProps={{
							sx: {
								color: '#94a3b8',
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
									backgroundColor: 'rgba(56, 189, 248, 0.12)',
									color: '#38bdf8',
									fontWeight: 600,
									fontSize: 11,
									height: 22,
									border: '1px solid rgba(56, 189, 248, 0.25)',
								}}
							/>
							<Chip
								icon={<ShieldIcon sx={{ fontSize: '13px !important', color: '#10b981 !important' }} />}
								label="Encrypted"
								size="small"
								sx={{
									backgroundColor: 'rgba(16, 185, 129, 0.12)',
									color: '#10b981',
									fontWeight: 600,
									fontSize: 11,
									height: 22,
									border: '1px solid rgba(16, 185, 129, 0.25)',
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
							sx={{ color: '#94a3b8', '&:hover': { color: '#818cf8', backgroundColor: 'rgba(99, 102, 241, 0.1)' } }}
						>
							<InfoIcon fontSize="small" />
						</IconButton>
						<IconButton
							size="small"
							onClick={download}
							title="Decrypt & Download"
							sx={{ color: '#94a3b8', '&:hover': { color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)' } }}
						>
							<DownloadIcon fontSize="small" />
						</IconButton>
					</Show>

					<IconButton
						size="small"
						onClick={(event) => setMoreAnchorEl(event.currentTarget)}
						sx={{ color: '#94a3b8', '&:hover': { color: '#f8fafc' } }}
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
						backgroundColor: '#152238',
						color: '#f8fafc',
						border: '1px solid rgba(255, 255, 255, 0.1)',
						borderRadius: 2,
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
						<ListItemIcon sx={{ color: '#818cf8' }}>
							<InfoIcon fontSize="small" />
						</ListItemIcon>
						<ListItemText>AES-256 Chunk Inspector</ListItemText>
					</MenuItem>

					<MenuItem onClick={download}>
						<ListItemIcon sx={{ color: '#10b981' }}>
							<DownloadIcon fontSize="small" />
						</ListItemIcon>
						<ListItemText>Decrypt & Download</ListItemText>
					</MenuItem>
				</Show>

				<MenuItem onClick={openActionConfirmDialog} sx={{ color: '#ef4444' }}>
					<ListItemIcon sx={{ color: '#ef4444' }}>
						<DeleteIcon fontSize="small" />
					</ListItemIcon>
					<ListItemText>Delete</ListItemText>
				</MenuItem>
			</MenuMUI>

			<ActionConfirmDialog
				action="Delete"
				entity="file"
				actionDescription={`delete ${props.fsElement.name}`}
				isOpened={isActionConfirmDialogOpened()}
				onConfirm={deleteFile}
				onCancel={closeActionConfirmDialog}
			/>

			<FileInfoDialog
				file={props.fsElement}
				storageId={activeStorageId()}
				isOpened={isInfoDialogOpened()}
				onClose={() => setIsInfoDialogOpened(false)}
				onDownload={props.fsElement.is_file ? download : undefined}
			/>
		</>
	)
}

export default FSListItem
