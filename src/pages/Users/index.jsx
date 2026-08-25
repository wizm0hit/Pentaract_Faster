import { createSignal, onMount, For, Show } from 'solid-js'
import Box from '@suid/material/Box'
import Typography from '@suid/material/Typography'
import Button from '@suid/material/Button'
import Paper from '@suid/material/Paper'
import Table from '@suid/material/Table'
import TableBody from '@suid/material/TableBody'
import TableCell from '@suid/material/TableCell'
import TableContainer from '@suid/material/TableContainer'
import TableHead from '@suid/material/TableHead'
import TableRow from '@suid/material/TableRow'
import Chip from '@suid/material/Chip'
import IconButton from '@suid/material/IconButton'
import Dialog from '@suid/material/Dialog'
import DialogTitle from '@suid/material/DialogTitle'
import DialogContent from '@suid/material/DialogContent'
import DialogActions from '@suid/material/DialogActions'
import TextField from '@suid/material/TextField'
import FormControl from '@suid/material/FormControl'
import InputLabel from '@suid/material/InputLabel'
import Select from '@suid/material/Select'
import MenuItem from '@suid/material/MenuItem'
import Alert from '@suid/material/Alert'
import CircularProgress from '@suid/material/CircularProgress'

import PersonAddIcon from '@suid/icons-material/PersonAdd'
import DeleteIcon from '@suid/icons-material/Delete'
import LockResetIcon from '@suid/icons-material/LockReset'
import AdminPanelSettingsIcon from '@suid/icons-material/AdminPanelSettings'
import PersonIcon from '@suid/icons-material/Person'
import RefreshIcon from '@suid/icons-material/Refresh'
import ShieldIcon from '@suid/icons-material/Shield'

import API from '../../api'
import createLocalStore from '../../../libs'
import { alertStore } from '../../components/AlertStack'
import { checkAuth } from '../../common/auth_guard'

const UsersPage = () => {
	checkAuth()
	const [store] = createLocalStore()
	const { addAlert } = alertStore

	const [users, setUsers] = createSignal([])
	const [loading, setLoading] = createSignal(true)

	// Create User Dialog
	const [createOpen, setCreateOpen] = createSignal(false)
	const [newEmail, setNewEmail] = createSignal('')
	const [newPassword, setNewPassword] = createSignal('')
	const [newRole, setNewRole] = createSignal('user')
	const [createLoading, setCreateLoading] = createSignal(false)
	const [createError, setCreateError] = createSignal('')

	// Reset Password Dialog
	const [resetOpen, setResetOpen] = createSignal(false)
	const [targetUser, setTargetUser] = createSignal(null)
	const [resetPassword, setResetPassword] = createSignal('')
	const [resetLoading, setResetLoading] = createSignal(false)
	const [resetError, setResetError] = createSignal('')

	// Delete Confirm Dialog
	const [deleteOpen, setDeleteOpen] = createSignal(false)
	const [userToDelete, setUserToDelete] = createSignal(null)
	const [deleteLoading, setDeleteLoading] = createSignal(false)

	const loadUsers = async () => {
		setLoading(true)
		try {
			const res = await API.admin.listUsers()
			setUsers(res.users || [])
		} catch (err) {
			console.error(err)
		} finally {
			setLoading(false)
		}
	}

	onMount(() => {
		loadUsers()
	})

	const handleCreateUser = async (e) => {
		e.preventDefault()
		setCreateError('')

		if (!newEmail() || !newPassword()) {
			setCreateError('Email and password are required.')
			return
		}

		if (newPassword().length < 6) {
			setCreateError('Password must be at least 6 characters long.')
			return
		}

		setCreateLoading(true)
		try {
			await API.admin.createUser(newEmail(), newPassword(), newRole())
			addAlert(`User account ${newEmail()} created successfully!`, 'success')
			setCreateOpen(false)
			setNewEmail('')
			setNewPassword('')
			setNewRole('user')
			loadUsers()
		} catch (err) {
			setCreateError(err.message || 'Failed to create user.')
		} finally {
			setCreateLoading(false)
		}
	}

	const handleResetPassword = async (e) => {
		e.preventDefault()
		setResetError('')

		if (!resetPassword() || resetPassword().length < 6) {
			setResetError('New password must be at least 6 characters long.')
			return
		}

		setResetLoading(true)
		try {
			await API.admin.resetPassword(targetUser().id, resetPassword())
			addAlert(`Password for ${targetUser().email} updated successfully!`, 'success')
			setResetOpen(false)
			setResetPassword('')
			setTargetUser(null)
		} catch (err) {
			setResetError(err.message || 'Failed to update password.')
		} finally {
			setResetLoading(false)
		}
	}

	const handleDeleteUser = async () => {
		if (!userToDelete()) return
		setDeleteLoading(true)
		try {
			await API.admin.deleteUser(userToDelete().id)
			addAlert(`User ${userToDelete().email} deleted successfully.`, 'success')
			setDeleteOpen(false)
			setUserToDelete(null)
			loadUsers()
		} catch (err) {
			console.error(err)
		} finally {
			setDeleteLoading(false)
		}
	}

	const formatDate = (dateStr) => {
		if (!dateStr) return 'N/A'
		try {
			return new Date(dateStr).toLocaleString()
		} catch {
			return dateStr
		}
	}

	return (
		<Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
			{/* Page Header */}
			<Box
				sx={{
					display: 'flex',
					flexDirection: { xs: 'column', sm: 'row' },
					alignItems: { xs: 'flex-start', sm: 'center' },
					justifyContent: 'space-between',
					gap: 2,
					mb: 3.5,
				}}
			>
				<Box>
					<Typography variant="h5" sx={{ fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
						User Management
					</Typography>
					<Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5 }}>
						Database-backed credentials & role-based vault authorization
					</Typography>
				</Box>

				<Box sx={{ display: 'flex', gap: 1.5 }}>
					<Button
						variant="outlined"
						startIcon={<RefreshIcon />}
						onClick={loadUsers}
						disabled={loading()}
						sx={{
							color: '#cbd5e1',
							borderColor: 'rgba(255, 255, 255, 0.12)',
							textTransform: 'none',
							fontWeight: 600,
							borderRadius: 2,
						}}
					>
						Refresh
					</Button>
					<Button
						variant="contained"
						startIcon={<PersonAddIcon />}
						onClick={() => setCreateOpen(true)}
						sx={{
							background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
							color: 'white',
							textTransform: 'none',
							fontWeight: 700,
							borderRadius: 2,
							boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
						}}
					>
						Create Account
					</Button>
				</Box>
			</Box>

			{/* Security Banner */}
			<Paper
				sx={{
					p: 2,
					mb: 3,
					borderRadius: 2.5,
					backgroundColor: 'rgba(99, 102, 241, 0.07)',
					border: '1px solid rgba(99, 102, 241, 0.2)',
					display: 'flex',
					alignItems: 'center',
					gap: 1.5,
				}}
			>
				<ShieldIcon sx={{ color: '#818cf8', fontSize: 22 }} />
				<Typography variant="body2" sx={{ color: '#cbd5e1', fontSize: 13 }}>
					<strong>Private Database Storage:</strong> User credentials are cryptographic PBKDF2 hashed and stored in persistent disk database. Public account creation is disabled.
				</Typography>
			</Paper>

			{/* Users Table */}
			<TableContainer
				component={Paper}
				sx={{
					borderRadius: 3,
					backgroundColor: '#0d1527',
					border: '1px solid rgba(255, 255, 255, 0.08)',
					overflow: 'hidden',
				}}
			>
				<Table>
					<TableHead sx={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
						<TableRow>
							<TableCell sx={{ color: '#94a3b8', fontWeight: 700, borderColor: 'rgba(255, 255, 255, 0.06)' }}>
								Account Email
							</TableCell>
							<TableCell sx={{ color: '#94a3b8', fontWeight: 700, borderColor: 'rgba(255, 255, 255, 0.06)' }}>
								Role
							</TableCell>
							<TableCell sx={{ color: '#94a3b8', fontWeight: 700, borderColor: 'rgba(255, 255, 255, 0.06)' }}>
								Created At
							</TableCell>
							<TableCell sx={{ color: '#94a3b8', fontWeight: 700, borderColor: 'rgba(255, 255, 255, 0.06)' }}>
								Created By
							</TableCell>
							<TableCell align="right" sx={{ color: '#94a3b8', fontWeight: 700, borderColor: 'rgba(255, 255, 255, 0.06)' }}>
								Actions
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						<Show when={!loading()} fallback={
							<TableRow>
								<TableCell colSpan={5} align="center" sx={{ py: 6, borderColor: 'rgba(255, 255, 255, 0.06)' }}>
									<CircularProgress size={28} sx={{ color: '#6366f1' }} />
								</TableCell>
							</TableRow>
						}>
							<For each={users()}>
								{(u) => (
									<TableRow
										sx={{
											borderColor: 'rgba(255, 255, 255, 0.06)',
											'&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.02)' },
										}}
									>
										<TableCell sx={{ color: '#f8fafc', fontWeight: 600, borderColor: 'rgba(255, 255, 255, 0.06)' }}>
											<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
												<Box
													sx={{
														width: 32,
														height: 32,
														borderRadius: 1.5,
														backgroundColor: u.role === 'admin' ? 'rgba(99, 102, 241, 0.18)' : 'rgba(56, 189, 248, 0.12)',
														display: 'flex',
														alignItems: 'center',
														justifyContent: 'center',
														color: u.role === 'admin' ? '#818cf8' : '#38bdf8',
													}}
												>
													{u.role === 'admin' ? <AdminPanelSettingsIcon sx={{ fontSize: 18 }} /> : <PersonIcon sx={{ fontSize: 18 }} />}
												</Box>
												<Box>
													<Typography sx={{ color: '#f8fafc', fontSize: 14, fontWeight: 600 }}>
														{u.email}
													</Typography>
													{store.user?.email === u.email && (
														<Typography variant="caption" sx={{ color: '#10b981', fontWeight: 700, fontSize: 10.5 }}>
															(You - Active Session)
														</Typography>
													)}
												</Box>
											</Box>
										</TableCell>
										<TableCell sx={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}>
											<Chip
												label={u.role === 'admin' ? 'Administrator' : 'Standard User'}
												size="small"
												sx={{
													backgroundColor: u.role === 'admin' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(56, 189, 248, 0.12)',
													color: u.role === 'admin' ? '#a5b4fc' : '#7dd3fc',
													border: `1px solid ${u.role === 'admin' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(56, 189, 248, 0.25)'}`,
													fontWeight: 700,
													fontSize: 11,
												}}
											/>
										</TableCell>
										<TableCell sx={{ color: '#94a3b8', fontSize: 13, borderColor: 'rgba(255, 255, 255, 0.06)' }}>
											{formatDate(u.createdAt)}
										</TableCell>
										<TableCell sx={{ color: '#94a3b8', fontSize: 13, borderColor: 'rgba(255, 255, 255, 0.06)' }}>
											{u.createdBy || 'System'}
										</TableCell>
										<TableCell align="right" sx={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}>
											<Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
												<IconButton
													size="small"
													title="Reset Password"
													onClick={() => {
														setTargetUser(u)
														setResetPassword('')
														setResetError('')
														setResetOpen(true)
													}}
													sx={{
														color: '#94a3b8',
														backgroundColor: 'rgba(255, 255, 255, 0.04)',
														'&:hover': { color: '#6366f1', backgroundColor: 'rgba(99, 102, 241, 0.15)' },
													}}
												>
													<LockResetIcon fontSize="small" />
												</IconButton>

												<IconButton
													size="small"
													title={store.user?.email === u.email ? 'Cannot delete current active session account' : 'Delete Account'}
													disabled={store.user?.email === u.email}
													onClick={() => {
														setUserToDelete(u)
														setDeleteOpen(true)
													}}
													sx={{
														color: '#94a3b8',
														backgroundColor: 'rgba(255, 255, 255, 0.04)',
														'&:hover': { color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.15)' },
													}}
												>
													<DeleteIcon fontSize="small" />
												</IconButton>
											</Box>
										</TableCell>
									</TableRow>
								)}
							</For>
						</Show>
					</TableBody>
				</Table>
			</TableContainer>

			{/* Create User Dialog */}
			<Dialog
				open={createOpen()}
				onClose={() => setCreateOpen(false)}
				PaperProps={{
					sx: {
						backgroundColor: '#0d1527',
						border: '1px solid rgba(255, 255, 255, 0.1)',
						borderRadius: 3,
						maxWidth: 440,
						width: '100%',
					},
				}}
			>
				<DialogTitle sx={{ color: '#f8fafc', fontWeight: 800, pb: 1 }}>
					Create New User Account
				</DialogTitle>
				<Box component="form" onSubmit={handleCreateUser}>
					<DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
						{createError() && (
							<Alert severity="error" sx={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 2 }}>
								{createError()}
							</Alert>
						)}

						<TextField
							label="User Email"
							type="email"
							placeholder="user@example.com"
							value={newEmail()}
							onChange={(e) => setNewEmail(e.target.value)}
							required
							fullWidth
							InputLabelProps={{ sx: { color: '#94a3b8' } }}
							InputProps={{
								sx: {
									color: '#f8fafc',
									backgroundColor: 'rgba(255, 255, 255, 0.03)',
									borderRadius: 2,
								},
							}}
						/>

						<TextField
							label="Initial Password"
							type="password"
							placeholder="At least 6 characters"
							value={newPassword()}
							onChange={(e) => setNewPassword(e.target.value)}
							required
							fullWidth
							InputLabelProps={{ sx: { color: '#94a3b8' } }}
							InputProps={{
								sx: {
									color: '#f8fafc',
									backgroundColor: 'rgba(255, 255, 255, 0.03)',
									borderRadius: 2,
								},
							}}
						/>

						<FormControl fullWidth>
							<InputLabel sx={{ color: '#94a3b8' }}>Account Role</InputLabel>
							<Select
								value={newRole()}
								label="Account Role"
								onChange={(e) => setNewRole(e.target.value)}
								sx={{
									color: '#f8fafc',
									backgroundColor: 'rgba(255, 255, 255, 0.03)',
									borderRadius: 2,
									borderColor: 'rgba(255, 255, 255, 0.1)',
								}}
							>
								<MenuItem value="user">Standard User (Storage Access)</MenuItem>
								<MenuItem value="admin">Administrator (Full Access & User Management)</MenuItem>
							</Select>
						</FormControl>
					</DialogContent>
					<DialogActions sx={{ p: 3, pt: 1, gap: 1 }}>
						<Button
							onClick={() => setCreateOpen(false)}
							sx={{ color: '#94a3b8', textTransform: 'none' }}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							variant="contained"
							disabled={createLoading()}
							sx={{
								background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
								color: 'white',
								textTransform: 'none',
								fontWeight: 700,
								borderRadius: 2,
							}}
						>
							{createLoading() ? 'Creating...' : 'Create Account'}
						</Button>
					</DialogActions>
				</Box>
			</Dialog>

			{/* Reset Password Dialog */}
			<Dialog
				open={resetOpen()}
				onClose={() => setResetOpen(false)}
				PaperProps={{
					sx: {
						backgroundColor: '#0d1527',
						border: '1px solid rgba(255, 255, 255, 0.1)',
						borderRadius: 3,
						maxWidth: 420,
						width: '100%',
					},
				}}
			>
				<DialogTitle sx={{ color: '#f8fafc', fontWeight: 800, pb: 1 }}>
					Reset Password
				</DialogTitle>
				<Box component="form" onSubmit={handleResetPassword}>
					<DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
						<Typography variant="body2" sx={{ color: '#94a3b8' }}>
							Set a new password for account: <strong>{targetUser()?.email}</strong>
						</Typography>

						{resetError() && (
							<Alert severity="error" sx={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 2 }}>
								{resetError()}
							</Alert>
						)}

						<TextField
							label="New Password"
							type="password"
							placeholder="At least 6 characters"
							value={resetPassword()}
							onChange={(e) => setResetPassword(e.target.value)}
							required
							fullWidth
							InputLabelProps={{ sx: { color: '#94a3b8' } }}
							InputProps={{
								sx: {
									color: '#f8fafc',
									backgroundColor: 'rgba(255, 255, 255, 0.03)',
									borderRadius: 2,
								},
							}}
						/>
					</DialogContent>
					<DialogActions sx={{ p: 3, pt: 1, gap: 1 }}>
						<Button
							onClick={() => setResetOpen(false)}
							sx={{ color: '#94a3b8', textTransform: 'none' }}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							variant="contained"
							disabled={resetLoading()}
							sx={{
								background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
								color: 'white',
								textTransform: 'none',
								fontWeight: 700,
								borderRadius: 2,
							}}
						>
							{resetLoading() ? 'Updating...' : 'Update Password'}
						</Button>
					</DialogActions>
				</Box>
			</Dialog>

			{/* Delete Confirm Dialog */}
			<Dialog
				open={deleteOpen()}
				onClose={() => setDeleteOpen(false)}
				PaperProps={{
					sx: {
						backgroundColor: '#0d1527',
						border: '1px solid rgba(255, 255, 255, 0.1)',
						borderRadius: 3,
						maxWidth: 420,
						width: '100%',
					},
				}}
			>
				<DialogTitle sx={{ color: '#f8fafc', fontWeight: 800 }}>
					Delete User Account?
				</DialogTitle>
				<DialogContent>
					<Typography sx={{ color: '#94a3b8', fontSize: 14 }}>
						Are you sure you want to permanently delete the account for <strong>{userToDelete()?.email}</strong>? They will immediately lose access to all vaults and storage files.
					</Typography>
				</DialogContent>
				<DialogActions sx={{ p: 3, pt: 1, gap: 1 }}>
					<Button
						onClick={() => setDeleteOpen(false)}
						sx={{ color: '#94a3b8', textTransform: 'none' }}
					>
						Cancel
					</Button>
					<Button
						variant="contained"
						color="error"
						disabled={deleteLoading()}
						onClick={handleDeleteUser}
						sx={{
							textTransform: 'none',
							fontWeight: 700,
							borderRadius: 2,
						}}
					>
						{deleteLoading() ? 'Deleting...' : 'Delete Account'}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	)
}

export default UsersPage
