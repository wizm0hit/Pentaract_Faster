import Divider from '@suid/material/Divider'
import Box from '@suid/material/Box'
import Button from '@suid/material/Button'
import TextField from '@suid/material/TextField'
import Typography from '@suid/material/Typography'
import { useNavigate, useParams } from '@solidjs/router'
import Stack from '@suid/material/Stack'
import ChevronLeftIcon from '@suid/icons-material/ChevronLeft'
import LinearProgress from '@suid/material/LinearProgress'
import Card from '@suid/material/Card'
import CardContent from '@suid/material/CardContent'
import Paper from '@suid/material/Paper'
import { Show, createSignal } from 'solid-js'

import API from '../../api'
import { alertStore } from '../../components/AlertStack'

const UploadFileTo = () => {
	const { addAlert } = alertStore
	const navigate = useNavigate()
	const params = useParams()
	const [uploadProgress, setUploadProgress] = createSignal(0)
	const [isUploading, setIsUploading] = createSignal(false)
	const [uploadingFileName, setUploadingFileName] = createSignal('')

	const navigateToFiles = () => {
		navigate(`/storages/${params.id}/files`)
	}

	/**
	 *
	 * @param {SubmitEvent} event
	 */
	const handleSubmit = async (event) => {
		event.preventDefault()

		const data = new FormData(event.currentTarget)

		const path = data.get('path')
		const file = data.get('file')

		if (!file || !path) {
			addAlert('Please fill in all fields', 'error')
			return
		}

		setIsUploading(true)
		setUploadingFileName(file.name)
		setUploadProgress(0)

		try {
			await API.files.uploadFileTo(
				params.id,
				path,
				file,
				(progress) => {
					setUploadProgress(progress)
				}
			)

			addAlert(`Uploaded file to "${path}"`, 'success')
			navigateToFiles()
		} catch (err) {
			console.error('Upload error:', err)
		} finally {
			setIsUploading(false)
			setUploadProgress(0)
			setUploadingFileName('')
		}
	}

	return (
		<Stack spacing={3} sx={{ maxWidth: 600, minWidth: 320, mx: 'auto', p: 3 }}>
			<Button
				onClick={navigateToFiles}
				variant="outlined"
				startIcon={<ChevronLeftIcon />}
				sx={{
					alignSelf: 'flex-start',
					transition: 'all 0.3s ease',
					'&:hover': {
						transform: 'translateX(-4px)',
					},
				}}
			>
				Back
			</Button>

			{/* Upload Progress Bar */}
			<Show when={isUploading()}>
				<Paper
					elevation={3}
					sx={{
						p: 2,
						background:
							'linear-gradient(135deg, rgba(249, 233, 0, 0.1) 0%, rgba(13, 24, 33, 0.05) 100%)',
						borderRadius: 2,
					}}
				>
					<Box sx={{ mb: 1 }}>
						<Typography variant="body2" color="text.secondary">
							Uploading: {uploadingFileName()}
						</Typography>
					</Box>
					<LinearProgress
						variant="determinate"
						value={uploadProgress()}
						sx={{
							height: 8,
							borderRadius: 4,
							backgroundColor: 'rgba(0, 0, 0, 0.1)',
							'& .MuiLinearProgress-bar': {
								borderRadius: 4,
								background:
									'linear-gradient(90deg, #F9E900 0%, #FFD700 100%)',
							},
						}}
					/>
					<Box sx={{ mt: 1 }}>
						<Typography variant="caption" color="text.secondary">
							{Math.round(uploadProgress())}%
						</Typography>
					</Box>
				</Paper>
			</Show>

			<Card
				elevation={3}
				sx={{
					background:
						'linear-gradient(135deg, rgba(13, 24, 33, 0.02) 0%, rgba(249, 233, 0, 0.05) 100%)',
					borderRadius: 3,
				}}
			>
				<CardContent>
					<Box
						component="form"
						onSubmit={handleSubmit}
						sx={{
							py: 2,
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							'& > :not(style)': { my: 2, width: '100%' },
						}}
					>
						<Typography
							variant="h5"
							sx={{
								fontWeight: 600,
								background:
									'linear-gradient(135deg, #0D1821 0%, #34495e 100%)',
								backgroundClip: 'text',
								WebkitBackgroundClip: 'text',
								WebkitTextFillColor: 'transparent',
							}}
						>
							Upload file to
						</Typography>

						<Divider sx={{ width: '100%' }} />

						<TextField
							id="path"
							name="path"
							label="Path"
							variant="outlined"
							fullWidth
							required
							disabled={isUploading()}
							sx={{
								'& .MuiOutlinedInput-root': {
									transition: 'all 0.3s ease',
									'&:hover': {
										transform: 'translateY(-2px)',
									},
								},
							}}
						/>

						<TextField
							id="file"
							name="file"
							label="File"
							type="file"
							variant="outlined"
							fullWidth
							required
							disabled={isUploading()}
							InputLabelProps={{
								shrink: true,
							}}
							sx={{
								'& .MuiOutlinedInput-root': {
									transition: 'all 0.3s ease',
									'&:hover': {
										transform: 'translateY(-2px)',
									},
								},
							}}
						/>

						<Button
							type="submit"
							variant="contained"
							color="secondary"
							fullWidth
							disabled={isUploading()}
							sx={{
								py: 1.5,
								fontSize: '1.1rem',
								fontWeight: 600,
								transition: 'all 0.3s ease',
								'&:hover': {
									transform: 'translateY(-2px)',
									boxShadow: 6,
								},
								'&:disabled': {
									opacity: 0.6,
								},
							}}
						>
							{isUploading() ? 'Uploading...' : 'Upload'}
						</Button>
					</Box>
				</CardContent>
			</Card>
		</Stack>
	)
}

export default UploadFileTo
