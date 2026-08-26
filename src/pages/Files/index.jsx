import { useBeforeLeave, useNavigate, useParams } from '@solidjs/router'
import { Show, createSignal, mapArray, onCleanup, onMount, createMemo } from 'solid-js'
import List from '@suid/material/List'
import MenuItem from '@suid/material/MenuItem'
import ListItemIcon from '@suid/material/ListItemIcon'
import ListItemText from '@suid/material/ListItemText'
import UploadFileIcon from '@suid/icons-material/UploadFile'
import CreateNewFolderIcon from '@suid/icons-material/CreateNewFolder'
import FolderOpenIcon from '@suid/icons-material/FolderOpen'
import LockIcon from '@suid/icons-material/Lock'
import ShieldIcon from '@suid/icons-material/Shield'
import Typography from '@suid/material/Typography'
import Divider from '@suid/material/Divider'
import Button from '@suid/material/Button'
import IconButton from '@suid/material/IconButton'
import ToggleButton from '@suid/material/ToggleButton'
import ToggleButtonGroup from '@suid/material/ToggleButtonGroup'
import LinearProgress from '@suid/material/LinearProgress'
import Box from '@suid/material/Box'
import Paper from '@suid/material/Paper'
import Chip from '@suid/material/Chip'
import TextField from '@suid/material/TextField'
import InputAdornment from '@suid/material/InputAdornment'
import SearchIcon from '@suid/icons-material/Search'
import CloudUploadIcon from '@suid/icons-material/CloudUpload'
import ChevronRightIcon from '@suid/icons-material/ChevronRight'
import ChevronLeftIcon from '@suid/icons-material/ChevronLeft'
import PersonAddIcon from '@suid/icons-material/PersonAdd'
import StorageIcon from '@suid/icons-material/Storage'

import API from '../../api'
import FSListItem from '../../components/FSListItem'
import Menu from '../../components/Menu'
import CreateFolderDialog from '../../components/CreateFolderDialog'
import { alertStore } from '../../components/AlertStack'
import uploadManager from '../../common/uploadManager'
import Access from '../../components/Access'
import GrantAccess from '../../components/GrantAccess'
import createLocalStore from '../../../libs'

const Files = () => {
	const { addAlert } = alertStore
	const [store] = createLocalStore()
	const isAdmin = () => store.user?.role === 'admin'
	const [fsLayer, setFsLayer] = createSignal([])
	const [storage, setStorage] = createSignal()
	const [isAccessPage, setIsAccessPage] = createSignal(false)
	const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] = createSignal(false)
	const [isGrantAccessButtonVisible, setIsGrantButtonAccessVisible] = createSignal(false)
	const [isGrantAccessVisible, setIsGrantAccessVisible] = createSignal(false)
	const [users, setUsers] = createSignal([])
	const [downloadProgress, setDownloadProgress] = createSignal(0)
	const [isDownloading, setIsDownloading] = createSignal(false)
	const [downloadingFileName, setDownloadingFileName] = createSignal('')
	const [searchQuery, setSearchQuery] = createSignal('')
	const [isDraggingOver, setIsDraggingOver] = createSignal(false)

	const navigate = useNavigate()
	const params = useParams()
	const basePath = `/storages/${params.id}/files`

	let uploadFileInputElement

	const fetchUsersWithAccess = async () => {
		if (!isAdmin()) return
		try {
			const usersRes = await API.access.listUsersWithAccess(params.id)
			setUsers(usersRes || [])
			setIsGrantButtonAccessVisible(true)
		} catch (err) {
			setIsGrantButtonAccessVisible(false)
		}
	}

	const fetchStorage = async () => {
		try {
			const storageRes = await API.storages.getStorage(params.id)
			setStorage(storageRes)
		} catch (err) {
			console.error(err)
		}
	}

	const fetchFSLayer = async (path = params.path) => {
		try {
			const fsLayerRes = await API.files.getFSLayer(params.id, path)
			if (path && path.length) {
				const pathParts = path.split('/')
				const parentPath = pathParts.slice(0, -1).join('/')
				const backToParent = { is_file: false, name: '.. (Back to Parent)', path: parentPath }
				fsLayerRes.splice(0, 0, backToParent)
			}
			setFsLayer(fsLayerRes || [])
		} catch (err) {
			console.error(err)
		}
	}

	const reload = async () => {
		if (window.location.pathname.startsWith(basePath)) {
			await fetchFSLayer()
		}
	}

	const handleUploadedEvent = (e) => {
		if (e.detail?.storageId === params.id) {
			fetchFSLayer()
		}
	}

	onMount(() => {
		const tasks = [fetchStorage(), fetchFSLayer()]
		if (isAdmin()) {
			tasks.push(fetchUsersWithAccess())
		}
		Promise.all(tasks).then()
		window.addEventListener('popstate', reload, false)
		window.addEventListener('pentaract:file_uploaded', handleUploadedEvent, false)
	})

	onCleanup(() => {
		window.removeEventListener('popstate', reload, false)
		window.removeEventListener('pentaract:file_uploaded', handleUploadedEvent, false)
	})

	useBeforeLeave(async (e) => {
		if (e.to.startsWith(basePath)) {
			let newPath = e.to.slice(basePath.length)
			if (newPath.startsWith('/')) {
				newPath = newPath.slice(1)
			}
			await fetchFSLayer(newPath)
		}
	})

	const openCreateFolderDialog = () => setIsCreateFolderDialogOpen(true)
	const closeCreateFolderDialog = () => setIsCreateFolderDialogOpen(false)

	const createFolder = async (folderName) => {
		const currPath = params.path || ''
		const targetPath = currPath.endsWith('/') ? currPath.slice(0, -1) : currPath
		await API.files.createFolder(params.id, targetPath, folderName)
		addAlert(`Created directory "${folderName}"`, 'success')
		await fetchFSLayer()
	}

	const uploadFileClickHandler = () => {
		uploadFileInputElement?.click()
	}

	const handleDownloadStart = (fileName) => {
		setIsDownloading(true)
		setDownloadingFileName(fileName)
		setDownloadProgress(0)
	}

	const handleDownloadEnd = () => {
		setIsDownloading(false)
		setDownloadProgress(0)
		setDownloadingFileName('')
	}

	const processFileUpload = async (file) => {
		if (!file) return
		await uploadManager.startUpload(params.id, params.path || '', file)
	}

	const uploadFile = async (event) => {
		const file = event.target.files?.[0]
		if (!file) return
		event.target.value = null
		await processFileUpload(file)
	}

	const handleDrop = async (e) => {
		e.preventDefault()
		setIsDraggingOver(false)
		const droppedFiles = e.dataTransfer?.files
		if (droppedFiles && droppedFiles.length > 0) {
			for (let i = 0; i < droppedFiles.length; i++) {
				await processFileUpload(droppedFiles[i])
			}
		}
	}

	const breadcrumbParts = () => {
		const p = params.path || ''
		if (!p) return []
		return p.split('/').filter(Boolean)
	}

	const filteredFsLayer = createMemo(() => {
		const q = searchQuery().toLowerCase().trim()
		if (!q) return fsLayer()
		return fsLayer().filter((item) => item.name.toLowerCase().includes(q))
	})

	return (
		<Box
			sx={{ pb: 6 }}
			onDragOver={(e) => {
				e.preventDefault()
				setIsDraggingOver(true)
			}}
			onDragLeave={(e) => {
				if (!e.currentTarget.contains(e.relatedTarget)) {
					setIsDraggingOver(false)
				}
			}}
			onDrop={handleDrop}
		>
			{/* Breadcrumb & Navigation Bar */}
			<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
					<Button
						onClick={() => navigate('/storages')}
						size="small"
						variant="text"
						startIcon={<StorageIcon sx={{ fontSize: 16 }} />}
						sx={{ color: '#94a3b8', textTransform: 'none', fontWeight: 600, px: 1 }}
					>
						Vaults
					</Button>
					<ChevronRightIcon sx={{ color: '#475569', fontSize: 16 }} />
					<Button
						onClick={() => navigate(`/storages/${params.id}/files`)}
						size="small"
						variant="text"
						sx={{
							color: breadcrumbParts().length === 0 ? '#f8fafc' : '#818cf8',
							fontWeight: 700,
							textTransform: 'none',
							px: 1,
						}}
					>
						{storage()?.name || 'Vault'}
					</Button>

					{breadcrumbParts().map((part, index) => {
						const subPath = breadcrumbParts().slice(0, index + 1).join('/')
						const isLast = index === breadcrumbParts().length - 1
						return (
							<>
								<ChevronRightIcon sx={{ color: '#475569', fontSize: 16 }} />
								<Button
									onClick={() => navigate(`/storages/${params.id}/files/${subPath}`)}
									size="small"
									variant="text"
									sx={{
										color: isLast ? '#f8fafc' : '#818cf8',
										fontWeight: isLast ? 700 : 500,
										textTransform: 'none',
										px: 1,
									}}
								>
									{part}
								</Button>
							</>
						)
					})}
				</Box>

				<Chip
					icon={<ShieldIcon sx={{ fontSize: '13px !important', color: '#10b981 !important' }} />}
					label="AES-256-GCM Active"
					size="small"
					sx={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', fontWeight: 700, fontSize: 11 }}
				/>
			</Box>

			{/* Download Progress Banner */}
			<Show when={isDownloading()}>
				<Paper
					sx={{
						p: 2,
						mb: 3,
						bgcolor: 'background.paper',
						border: '1px solid',
						borderColor: 'primary.main',
						borderRadius: '10px',
					}}
				>
					<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
						<Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
							Decrypting & Downloading: {downloadingFileName()}
						</Typography>
						<Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', fontFamily: 'monospace' }}>
							{Math.round(downloadProgress())}%
						</Typography>
					</Box>
					<LinearProgress
						variant="determinate"
						value={downloadProgress()}
						sx={{
							height: 6,
							borderRadius: '3px',
							bgcolor: 'action.hover',
							'& .MuiLinearProgress-bar': {
								borderRadius: '3px',
							},
						}}
					/>
				</Paper>
			</Show>

			{/* Top Control Bar */}
			<Paper
				sx={{
					p: 2,
					mb: 3,
					borderRadius: '12px',
					bgcolor: 'background.paper',
					border: '1px solid',
					borderColor: 'divider',
					display: 'flex',
					flexDirection: { xs: 'column', md: 'row' },
					alignItems: { xs: 'stretch', md: 'center' },
					justifyContent: 'space-between',
					gap: 2,
				}}
			>
				{/* View switcher and Search */}
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
					<Show when={isAdmin()}>
						<ToggleButtonGroup
							exclusive
							value={isAccessPage()}
							onChange={(_, val) => val !== null && setIsAccessPage(val)}
							sx={{
								borderRadius: '8px',
								border: '1px solid',
								borderColor: 'divider',
								'& .MuiToggleButton-root': {
									color: 'text.secondary',
									textTransform: 'none',
									fontWeight: 600,
									px: 2,
									py: 0.6,
									'&.Mui-selected': {
										color: 'primary.main',
										bgcolor: 'action.selected',
									},
								},
							}}
						>
							<ToggleButton value={false}>
								<FolderOpenIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
								Files Explorer
							</ToggleButton>
							<ToggleButton value={true}>
								<LockIcon fontSize="small" sx={{ mr: 1, color: 'warning.main' }} />
								Access Control
							</ToggleButton>
						</ToggleButtonGroup>
					</Show>

					<Show when={!isAccessPage() || !isAdmin()}>
						<TextField
							size="small"
							placeholder="Search in folder..."
							value={searchQuery()}
							onChange={(e) => setSearchQuery(e.target.value)}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
									</InputAdornment>
								),
								sx: {
									color: 'text.primary',
									borderRadius: '8px',
									fontSize: 13,
									width: { xs: '100%', sm: 220 },
								},
							}}
						/>
					</Show>
				</Box>

				{/* Actions */}
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
					<Show
						when={!isAccessPage() || !isAdmin()}
						fallback={
							<Show when={isAdmin() && isGrantAccessButtonVisible()}>
								<Button
									variant="contained"
									startIcon={<PersonAddIcon />}
									onClick={() => setIsGrantAccessVisible(true)}
									sx={{
										textTransform: 'none',
										fontWeight: 600,
										borderRadius: '8px',
										px: 2,
									}}
								>
									Grant User Access
								</Button>
								<GrantAccess
									isVisible={isGrantAccessVisible()}
									afterGrant={fetchUsersWithAccess}
									onClose={() => setIsGrantAccessVisible(false)}
								/>
							</Show>
						}
					>
						<Button
							variant="outlined"
							startIcon={<CreateNewFolderIcon />}
							onClick={openCreateFolderDialog}
							sx={{
								textTransform: 'none',
								fontWeight: 600,
								borderRadius: '8px',
								px: 2,
							}}
						>
							New Folder
						</Button>

						<Button
							variant="contained"
							startIcon={<CloudUploadIcon />}
							onClick={uploadFileClickHandler}
							sx={{
								textTransform: 'none',
								fontWeight: 600,
								borderRadius: '8px',
								px: 2,
							}}
						>
							Upload Encrypted File
						</Button>
					</Show>
				</Box>
			</Paper>

			{/* Main Content Area */}
			<Show
				when={!isAccessPage() || !isAdmin()}
				fallback={
					<Show when={isAdmin()}>
						<Access
							setIsGrantAccessVisible={setIsGrantAccessVisible}
							users={users()}
							onMount={fetchUsersWithAccess}
							refetchUsers={fetchUsersWithAccess}
						/>
					</Show>
				}
			>
				{/* Drag & Drop Overlay Feedback */}
				<Show when={isDraggingOver()}>
					<Paper
						sx={{
							p: 4,
							mb: 3,
							textAlign: 'center',
							borderRadius: '12px',
							border: '2px dashed',
							borderColor: 'primary.main',
							bgcolor: 'action.hover',
						}}
					>
						<CloudUploadIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
						<Typography variant="subtitle1" sx={{ color: 'text.primary', fontWeight: 600 }}>
							Drop file to slice & encrypt with AES-256-GCM
						</Typography>
					</Paper>
				</Show>

				{/* File Items List */}
				<Paper
					sx={{
						borderRadius: '12px',
						bgcolor: 'background.paper',
						border: '1px solid',
						borderColor: 'divider',
						p: 1.5,
					}}
				>
					<Show
						when={filteredFsLayer().length > 0}
						fallback={
							<Box sx={{ p: 6, textAlign: 'center' }}>
								<FolderOpenIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1.5 }} />
								<Typography variant="subtitle1" sx={{ color: 'text.primary', fontWeight: 600 }}>
									{searchQuery() ? 'No files match search' : 'This folder is empty'}
								</Typography>
								<Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5, maxWidth: 400, mx: 'auto' }}>
									Upload any file or drag & drop. Large files are automatically chunked and encrypted with AES-256-GCM.
								</Typography>
								<Button
									variant="contained"
									startIcon={<CloudUploadIcon />}
									onClick={uploadFileClickHandler}
									size="small"
									sx={{ textTransform: 'none', fontWeight: 600 }}
								>
									Upload First File
								</Button>
							</Box>
						}
					>
						<List sx={{ p: 0 }}>
							{mapArray(filteredFsLayer, (fsElement) => (
								<FSListItem
									fsElement={fsElement}
									storageId={params.id}
									onDelete={fetchFSLayer}
									onDownloadStart={handleDownloadStart}
									onDownloadProgress={setDownloadProgress}
									onDownloadEnd={handleDownloadEnd}
								/>
							))}
						</List>
					</Show>
				</Paper>

				<CreateFolderDialog
					isOpened={isCreateFolderDialogOpen()}
					onCreate={createFolder}
					onClose={closeCreateFolderDialog}
				/>
				<input
					ref={uploadFileInputElement}
					type="file"
					style="display: none"
					onChange={uploadFile}
				/>
			</Show>
		</Box>
	)
}

export default Files
