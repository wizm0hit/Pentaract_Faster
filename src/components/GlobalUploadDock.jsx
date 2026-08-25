import { Show, For, createMemo } from 'solid-js'
import Paper from '@suid/material/Paper'
import Box from '@suid/material/Box'
import Typography from '@suid/material/Typography'
import LinearProgress from '@suid/material/LinearProgress'
import IconButton from '@suid/material/IconButton'
import Button from '@suid/material/Button'
import Chip from '@suid/material/Chip'
import CloudUploadIcon from '@suid/icons-material/CloudUpload'
import CheckCircleIcon from '@suid/icons-material/CheckCircle'
import ErrorIcon from '@suid/icons-material/Error'
import CloseIcon from '@suid/icons-material/Close'
import MinimizeIcon from '@suid/icons-material/Minimize'
import OpenInFullIcon from '@suid/icons-material/OpenInFull'
import TelegramIcon from '@suid/icons-material/Send'
import LockIcon from '@suid/icons-material/Lock'
import DeleteSweepIcon from '@suid/icons-material/DeleteSweep'
import uploadManager from '../common/uploadManager'
import { convertSize } from '../common/size_converter'

const GlobalUploadDock = () => {
	const {
		tasks,
		activeCount,
		isMinimized,
		setIsMinimized,
		isDockOpen,
		setIsDockOpen,
		cancelUpload,
		dismissTask,
		clearCompleted,
	} = uploadManager

	const hasTasks = createMemo(() => tasks().length > 0)
	const isUploading = createMemo(() => activeCount() > 0)

	const overallProgress = createMemo(() => {
		const active = tasks().filter((t) => t.status === 'uploading')
		if (!active.length) return 100
		const sum = active.reduce((acc, t) => acc + t.progress, 0)
		return Math.round(sum / active.length)
	})

	return (
		<Show when={hasTasks() && isDockOpen()}>
			{/* Minimized Floating Pill */}
			<Show when={isMinimized()}>
				<Paper
					id="global-upload-dock-minimized"
					elevation={8}
					onClick={() => setIsMinimized(false)}
					sx={{
						position: 'fixed',
						bottom: 24,
						right: 24,
						zIndex: 1400,
						display: 'flex',
						alignItems: 'center',
						gap: 1.5,
						px: 2,
						py: 1.25,
						borderRadius: '24px',
						bgcolor: '#0f172a',
						border: '1px solid rgba(99, 102, 241, 0.4)',
						boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6), 0 0 16px rgba(99, 102, 241, 0.2)',
						cursor: 'pointer',
						transition: 'all 0.2s ease',
						'&:hover': {
							transform: 'translateY(-2px)',
							bgcolor: '#1e293b',
							borderColor: '#6366f1',
						},
					}}
				>
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							width: 28,
							height: 28,
							borderRadius: '50%',
							bgcolor: isUploading() ? 'rgba(99, 102, 241, 0.2)' : 'rgba(16, 185, 129, 0.2)',
							color: isUploading() ? '#818cf8' : '#34d399',
						}}
					>
						<Show
							when={isUploading()}
							fallback={<CheckCircleIcon sx={{ fontSize: 18 }} />}
						>
							<CloudUploadIcon sx={{ fontSize: 18 }} />
						</Show>
					</Box>

					<Box sx={{ minWidth: 120 }}>
						<Typography
							variant="body2"
							sx={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.85rem' }}
						>
							{isUploading()
								? `Uploading ${activeCount()} file${activeCount() > 1 ? 's' : ''}...`
								: 'All uploads complete'}
						</Typography>
						<Typography
							variant="caption"
							sx={{ color: '#94a3b8', fontSize: '0.75rem' }}
						>
							{isUploading()
								? `${overallProgress()}% • Direct Telegram Stream`
								: `${tasks().length} files in Telegram cloud`}
						</Typography>
					</Box>

					<IconButton
						size="small"
						onClick={(e) => {
							e.stopPropagation()
							setIsMinimized(false)
						}}
						sx={{ color: '#cbd5e1', p: 0.5 }}
					>
						<OpenInFullIcon sx={{ fontSize: 16 }} />
					</IconButton>
				</Paper>
			</Show>

			{/* Expanded Floating Upload Dock */}
			<Show when={!isMinimized()}>
				<Paper
					id="global-upload-dock-expanded"
					elevation={12}
					sx={{
						position: 'fixed',
						bottom: 24,
						right: 24,
						zIndex: 1400,
						width: 440,
						maxWidth: 'calc(100vw - 32px)',
						maxHeight: '75vh',
						borderRadius: '16px',
						bgcolor: '#0f172a',
						border: '1px solid rgba(99, 102, 241, 0.35)',
						boxShadow: '0 20px 48px rgba(0, 0, 0, 0.7), 0 0 24px rgba(99, 102, 241, 0.15)',
						display: 'flex',
						flexDirection: 'column',
						overflow: 'hidden',
					}}
				>
					{/* Dock Header */}
					<Box
						sx={{
							px: 2.5,
							py: 1.75,
							bgcolor: '#131d35',
							borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
						}}
					>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
							<Box
								sx={{
									width: 32,
									height: 32,
									borderRadius: '8px',
									bgcolor: 'rgba(99, 102, 241, 0.2)',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									color: '#818cf8',
								}}
							>
								<TelegramIcon sx={{ fontSize: 18 }} />
							</Box>
							<Box>
								<Typography
									variant="subtitle2"
									sx={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.9rem' }}
								>
									Telegram Direct Stream
								</Typography>
								<Typography
									variant="caption"
									sx={{ color: '#94a3b8', fontSize: '0.72rem' }}
								>
									{isUploading()
										? `${activeCount()} active • Streams directly across routes`
										: 'Uploads saved to Telegram cluster'}
								</Typography>
							</Box>
						</Box>

						<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
							<Show when={tasks().some((t) => t.status === 'completed')}>
								<IconButton
									id="upload-dock-clear-completed"
									size="small"
									title="Clear completed"
									onClick={clearCompleted}
									sx={{ color: '#94a3b8', '&:hover': { color: '#f8fafc' } }}
								>
									<DeleteSweepIcon sx={{ fontSize: 18 }} />
								</IconButton>
							</Show>
							<IconButton
								id="upload-dock-minimize-btn"
								size="small"
								title="Minimize dock"
								onClick={() => setIsMinimized(true)}
								sx={{ color: '#94a3b8', '&:hover': { color: '#f8fafc' } }}
							>
								<MinimizeIcon sx={{ fontSize: 18 }} />
							</IconButton>
							<IconButton
								id="upload-dock-close-btn"
								size="small"
								title="Close dock"
								onClick={() => {
									if (isUploading()) {
										setIsMinimized(true)
									} else {
										setIsDockOpen(false)
									}
								}}
								sx={{ color: '#94a3b8', '&:hover': { color: '#f8fafc' } }}
							>
								<CloseIcon sx={{ fontSize: 18 }} />
							</IconButton>
						</Box>
					</Box>

					{/* Overall Progress if actively uploading */}
					<Show when={isUploading()}>
						<LinearProgress
							variant="determinate"
							value={overallProgress()}
							sx={{
								height: 3,
								bgcolor: 'rgba(255, 255, 255, 0.05)',
								'& .MuiLinearProgress-bar': {
									bgcolor: '#6366f1',
								},
							}}
						/>
					</Show>

					{/* Task List */}
					<Box
						sx={{
							p: 2,
							overflowY: 'auto',
							display: 'flex',
							flexDirection: 'column',
							gap: 1.5,
							maxHeight: '380px',
						}}
					>
						<For each={tasks()}>
							{(task) => (
								<Box
									id={`upload-task-${task.id}`}
									sx={{
										p: 1.75,
										borderRadius: '12px',
										bgcolor: '#18223c',
										border: '1px solid',
										borderColor:
											task.status === 'uploading'
												? 'rgba(99, 102, 241, 0.3)'
												: task.status === 'completed'
												? 'rgba(16, 185, 129, 0.25)'
												: 'rgba(239, 68, 68, 0.25)',
										display: 'flex',
										flexDirection: 'column',
										gap: 1.2,
									}}
								>
									{/* Top row: File info + actions */}
									<Box
										sx={{
											display: 'flex',
											alignItems: 'flex-start',
											justifyContent: 'space-between',
											gap: 1,
										}}
									>
										<Box sx={{ minWidth: 0, flex: 1 }}>
											<Typography
												variant="body2"
												sx={{
													fontWeight: 600,
													color: '#f8fafc',
													overflow: 'hidden',
													textOverflow: 'ellipsis',
													whiteSpace: 'nowrap',
												}}
												title={task.fileName}
											>
												{task.fileName}
											</Typography>
											<Typography
												variant="caption"
												sx={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}
											>
												<span>{convertSize(task.fileSize)}</span>
												<span>•</span>
												<span>{task.totalChunks} slice{task.totalChunks > 1 ? 's' : ''}</span>
												<Show when={task.speed}>
													<span>•</span>
													<span style={{ color: '#38bdf8', 'font-weight': 600 }}>{task.speed}</span>
												</Show>
												<Show when={task.eta}>
													<span>•</span>
													<span style={{ color: '#a78bfa' }}>{task.eta}</span>
												</Show>
											</Typography>
										</Box>

										<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
											<Show when={task.status === 'uploading'}>
												<Chip
													label={`${task.progress}%`}
													size="small"
													sx={{
														height: 22,
														fontSize: '0.72rem',
														fontWeight: 700,
														bgcolor: 'rgba(99, 102, 241, 0.25)',
														color: '#a5b4fc',
														border: '1px solid rgba(99, 102, 241, 0.4)',
													}}
												/>
												<IconButton
													size="small"
													onClick={() => cancelUpload(task.id)}
													title="Cancel upload"
													sx={{ p: 0.5, color: '#f87171' }}
												>
													<CloseIcon sx={{ fontSize: 16 }} />
												</IconButton>
											</Show>

											<Show when={task.status === 'completed'}>
												<Chip
													icon={<CheckCircleIcon sx={{ fontSize: '14px !important', color: '#34d399 !important' }} />}
													label="In Telegram"
													size="small"
													sx={{
														height: 22,
														fontSize: '0.72rem',
														fontWeight: 600,
														bgcolor: 'rgba(16, 185, 129, 0.15)',
														color: '#34d399',
														border: '1px solid rgba(16, 185, 129, 0.3)',
													}}
												/>
												<IconButton
													size="small"
													onClick={() => dismissTask(task.id)}
													title="Dismiss"
													sx={{ p: 0.5, color: '#64748b' }}
												>
													<CloseIcon sx={{ fontSize: 16 }} />
												</IconButton>
											</Show>

											<Show when={task.status === 'error'}>
												<Chip
													icon={<ErrorIcon sx={{ fontSize: '14px !important', color: '#f87171 !important' }} />}
													label="Error"
													size="small"
													sx={{
														height: 22,
														fontSize: '0.72rem',
														fontWeight: 600,
														bgcolor: 'rgba(239, 68, 68, 0.15)',
														color: '#f87171',
													}}
												/>
												<IconButton
													size="small"
													onClick={() => dismissTask(task.id)}
													title="Dismiss"
													sx={{ p: 0.5, color: '#64748b' }}
												>
													<CloseIcon sx={{ fontSize: 16 }} />
												</IconButton>
											</Show>

											<Show when={task.status === 'cancelled'}>
												<Chip
													label="Cancelled"
													size="small"
													sx={{
														height: 22,
														fontSize: '0.72rem',
														bgcolor: 'rgba(148, 163, 184, 0.15)',
														color: '#94a3b8',
													}}
												/>
												<IconButton
													size="small"
													onClick={() => dismissTask(task.id)}
													sx={{ p: 0.5, color: '#64748b' }}
												>
													<CloseIcon sx={{ fontSize: 16 }} />
												</IconButton>
											</Show>
										</Box>
									</Box>

									{/* Progress bar */}
									<Box>
										<LinearProgress
											variant="determinate"
											value={task.progress}
											sx={{
												height: 6,
												borderRadius: 3,
												bgcolor: 'rgba(255, 255, 255, 0.08)',
												'& .MuiLinearProgress-bar': {
													borderRadius: 3,
													bgcolor:
														task.status === 'completed'
															? '#10b981'
															: task.status === 'error'
															? '#ef4444'
															: '#6366f1',
												},
											}}
										/>
									</Box>

									{/* Stage info / Telegram worker status */}
									<Box
										sx={{
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'space-between',
											gap: 1,
										}}
									>
										<Typography
											variant="caption"
											sx={{
												color:
													task.status === 'completed'
														? '#34d399'
														: task.status === 'error'
														? '#f87171'
														: '#cbd5e1',
												fontSize: '0.74rem',
												overflow: 'hidden',
												textOverflow: 'ellipsis',
												whiteSpace: 'nowrap',
												display: 'flex',
												alignItems: 'center',
												gap: 0.6,
											}}
										>
											<LockIcon sx={{ fontSize: 12, color: '#818cf8' }} />
											<span>{task.stage}</span>
										</Typography>

										<Show when={task.workerNames && task.workerNames.length > 0}>
											<Typography
												variant="caption"
												sx={{
													fontSize: '0.7rem',
													color: '#818cf8',
													whiteSpace: 'nowrap',
													bgcolor: 'rgba(99, 102, 241, 0.15)',
													px: 0.75,
													py: 0.2,
													borderRadius: '4px',
												}}
											>
												🤖 {task.workerNames.join(', ')}
											</Typography>
										</Show>
									</Box>
								</Box>
							)}
						</For>
					</Box>
				</Paper>
			</Show>
		</Show>
	)
}

export default GlobalUploadDock
