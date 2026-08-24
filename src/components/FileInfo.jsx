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
import Table from '@suid/material/Table'
import TableBody from '@suid/material/TableBody'
import TableCell from '@suid/material/TableCell'
import TableContainer from '@suid/material/TableContainer'
import TableHead from '@suid/material/TableHead'
import TableRow from '@suid/material/TableRow'
import CircularProgress from '@suid/material/CircularProgress'
import ShieldIcon from '@suid/icons-material/Shield'
import LockIcon from '@suid/icons-material/Lock'
import ContentCopyIcon from '@suid/icons-material/ContentCopy'
import DownloadIcon from '@suid/icons-material/Download'
import CheckCircleIcon from '@suid/icons-material/CheckCircle'
import { createSignal, createEffect, Show, For } from 'solid-js'

import { convertSize } from '../common/size_converter'
import API from '../api'
import { alertStore } from './AlertStack'

/**
 * @typedef {Object} FileInfoDialogProps
 * @property {import('../api').FSElement} file
 * @property {string} storageId
 * @property {boolean} isOpened
 * @property {() => void} onClose
 * @property {() => void} [onDownload]
 */

/**
 * @param {FileInfoDialogProps} props
 */
const FileInfoDialog = (props) => {
	const { addAlert } = alertStore
	const [detailedInfo, setDetailedInfo] = createSignal(null)
	const [loading, setLoading] = createSignal(false)
	const [copiedHash, setCopiedHash] = createSignal('')

	createEffect(async () => {
		if (props.isOpened && props.file && props.storageId) {
			setLoading(true)
			try {
				const info = await API.files.getFileInfo(props.storageId, props.file.path)
				setDetailedInfo(info)
			} catch (err) {
				console.error('Failed to load file chunk details:', err)
			} finally {
				setLoading(false)
			}
		}
	})

	const copyText = (text, label) => {
		navigator.clipboard.writeText(text)
		setCopiedHash(label)
		addAlert(`Copied ${label} to clipboard`, 'success')
		setTimeout(() => setCopiedHash(''), 2000)
	}

	return (
		<Dialog
			open={props.isOpened}
			onClose={props.onClose}
			maxWidth="md"
			fullWidth
			PaperProps={{
				sx: {
					borderRadius: 3,
					background: 'linear-gradient(135deg, #0b1320 0%, #152238 100%)',
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
					borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
					pb: 2,
				}}
			>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
					<Box
						sx={{
							width: 36,
							height: 36,
							borderRadius: 2,
							background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<ShieldIcon sx={{ color: 'white', fontSize: 20 }} />
					</Box>
					<Box>
						<Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc' }}>
							{props.file?.name}
						</Typography>
						<Typography variant="caption" sx={{ color: '#94a3b8' }}>
							Encrypted File & AES-256-GCM Chunk Inspector
						</Typography>
					</Box>
				</Box>
				<Chip
					label="AES-256-GCM"
					size="small"
					sx={{
						backgroundColor: 'rgba(16, 185, 129, 0.15)',
						color: '#10b981',
						fontWeight: 700,
						border: '1px solid rgba(16, 185, 129, 0.3)',
					}}
				/>
			</DialogTitle>

			<DialogContent sx={{ py: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
				{/* Top Overview Cards */}
				<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
					<Paper
						sx={{
							p: 2,
							borderRadius: 2,
							backgroundColor: 'rgba(255, 255, 255, 0.03)',
							border: '1px solid rgba(255, 255, 255, 0.06)',
						}}
					>
						<Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
							File Size
						</Typography>
						<Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc' }}>
							{convertSize(props.file?.size || 0)}
						</Typography>
						<Typography variant="caption" sx={{ color: '#64748b' }}>
							{props.file?.size?.toLocaleString()} bytes
						</Typography>
					</Paper>

					<Paper
						sx={{
							p: 2,
							borderRadius: 2,
							backgroundColor: 'rgba(255, 255, 255, 0.03)',
							border: '1px solid rgba(255, 255, 255, 0.06)',
						}}
					>
						<Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
							Encrypted Chunks
						</Typography>
						<Typography variant="h6" sx={{ fontWeight: 700, color: '#38bdf8' }}>
							{detailedInfo()?.chunks?.length || props.file?.chunks_count || 1} Chunks
						</Typography>
						<Typography variant="caption" sx={{ color: '#64748b' }}>
							5 MB standard slice
						</Typography>
					</Paper>

					<Paper
						sx={{
							p: 2,
							borderRadius: 2,
							backgroundColor: 'rgba(255, 255, 255, 0.03)',
							border: '1px solid rgba(255, 255, 255, 0.06)',
						}}
					>
						<Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
							Cryptographic Standard
						</Typography>
						<Typography variant="h6" sx={{ fontWeight: 700, color: '#10b981', fontSize: '1.05rem' }}>
							AES-256-GCM
						</Typography>
						<Typography variant="caption" sx={{ color: '#64748b' }}>
							Open-Source NIST SP 800-38D
						</Typography>
					</Paper>
				</Box>

				{/* Encryption Details Info Box */}
				<Paper
					sx={{
						p: 2,
						borderRadius: 2,
						background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(16, 185, 129, 0.05) 100%)',
						border: '1px solid rgba(99, 102, 241, 0.2)',
					}}
				>
					<Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#818cf8', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
						<LockIcon fontSize="small" /> Cryptographic Integrity & Open-Source Specification
					</Typography>
					<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1, fontSize: 13, color: '#cbd5e1' }}>
						<div>&bull; <strong>Cipher Algorithm:</strong> AES-256 in Galois/Counter Mode (GCM)</div>
						<div>&bull; <strong>Key Length:</strong> 256-bit Symmetric Key (PBKDF2/Scrypt derived)</div>
						<div>&bull; <strong>Initialization Vector:</strong> 96-bit (12 bytes) CSPRNG unique per chunk</div>
						<div>&bull; <strong>Authentication Tag:</strong> 128-bit (16 bytes) tamper-proof GMAC tag</div>
						<div>&bull; <strong>Data Hashing:</strong> SHA-256 checksum verification per segment</div>
						<div>&bull; <strong>Worker Distribution:</strong> Telegram Bot Storage Clusters</div>
					</Box>
				</Paper>

				{/* Chunks Breakdown Table */}
				<Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#f8fafc', mt: 1 }}>
					Encrypted Chunks Breakdown
				</Typography>

				<Show
					when={!loading() && detailedInfo()?.chunks?.length}
					fallback={
						<Box sx={{ p: 4, textAlign: 'center', color: '#94a3b8' }}>
							{loading() ? <CircularProgress size={28} sx={{ color: '#6366f1' }} /> : 'Loading encrypted chunk layout...'}
						</Box>
					}
				>
					<TableContainer
						component={Paper}
						sx={{
							maxHeight: 260,
							backgroundColor: 'rgba(0, 0, 0, 0.25)',
							border: '1px solid rgba(255, 255, 255, 0.08)',
							borderRadius: 2,
						}}
					>
						<Table size="small" stickyHeader>
							<TableHead>
								<TableRow sx={{ '& th': { backgroundColor: '#0d1527', color: '#94a3b8', fontWeight: 700 } }}>
									<TableCell>Chunk</TableCell>
									<TableCell>Encrypted Size</TableCell>
									<TableCell>IV (12B) / Tag (16B)</TableCell>
									<TableCell>SHA-256 Checksum</TableCell>
									<TableCell>Worker Node</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								<For each={detailedInfo()?.chunks}>
									{(chunk) => (
										<TableRow sx={{ '& td': { color: '#cbd5e1', borderColor: 'rgba(255,255,255,0.05)' } }}>
											<TableCell>
												<Chip
													label={`#${chunk.index + 1}`}
													size="small"
													sx={{ backgroundColor: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', fontWeight: 700 }}
												/>
											</TableCell>
											<TableCell>{convertSize(chunk.encrypted_size)}</TableCell>
											<TableCell sx={{ fontFamily: 'monospace', fontSize: 11 }}>
												<div>IV: <span style={{ color: '#38bdf8' }}>{chunk.iv_sample}</span></div>
												<div>Tag: <span style={{ color: '#10b981' }}>{chunk.auth_tag_sample}</span></div>
											</TableCell>
											<TableCell>
												<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
													<Typography sx={{ fontFamily: 'monospace', fontSize: 11, color: '#f59e0b' }}>
														{chunk.sha256_hash.substring(0, 10)}...{chunk.sha256_hash.substring(chunk.sha256_hash.length - 6)}
													</Typography>
													<IconButton
														size="small"
														onClick={() => copyText(chunk.sha256_hash, `Chunk ${chunk.index + 1} Hash`)}
														sx={{ color: '#64748b', p: 0.2 }}
													>
														<ContentCopyIcon sx={{ fontSize: 13 }} />
													</IconButton>
												</Box>
											</TableCell>
											<TableCell>
												<Chip
													label={chunk.worker_name || 'Cluster Worker'}
													size="small"
													sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#cbd5e1', fontSize: 11 }}
												/>
											</TableCell>
										</TableRow>
									)}
								</For>
							</TableBody>
						</Table>
					</TableContainer>
				</Show>
			</DialogContent>

			<DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
				<Button
					onClick={props.onClose}
					sx={{ color: '#94a3b8', textTransform: 'none', fontWeight: 600 }}
				>
					Close
				</Button>
				{props.onDownload && (
					<Button
						variant="contained"
						startIcon={<DownloadIcon />}
						onClick={() => {
							props.onClose()
							props.onDownload()
						}}
						sx={{
							background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
							color: 'white',
							textTransform: 'none',
							fontWeight: 600,
							px: 2.5,
						}}
					>
						Decrypt & Download
					</Button>
				)}
			</DialogActions>
		</Dialog>
	)
}

export default FileInfoDialog
