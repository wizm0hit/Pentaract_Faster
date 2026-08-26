import { createSignal, onMount, Show, For, createMemo } from 'solid-js'
import {
	Box,
	Typography,
	Card,
	CardContent,
	Button,
	Divider,
	Grid,
	Switch,
	FormControlLabel,
	Chip,
	LinearProgress,
	Alert,
	TextField,
	IconButton,
} from '@suid/material'
import {
	PaletteOutlined,
	SecurityOutlined,
	StorageOutlined,
	SpeedOutlined,
	RefreshOutlined,
	DeleteSweepOutlined,
	CheckCircleOutlined,
	CloudDownloadOutlined,
	CloudUploadOutlined,
	AdminPanelSettingsOutlined,
	PersonOutline,
	Check,
	SendOutlined,
} from '@suid/icons-material'
import createLocalStore from '../../libs'
import API from '../api'

const THEME_OPTIONS = [
	{
		id: 'midnight',
		name: 'Obsidian Dark',
		desc: 'Minimalist deep obsidian dark for low eye fatigue',
		bg: '#0b0f19',
		card: '#111827',
		border: '#1f2937',
		mode: 'dark',
	},
	{
		id: 'cyber',
		name: 'Deep Slate',
		desc: 'Pentaract signature deep space navy tone',
		bg: '#080e1a',
		card: '#0d1527',
		border: '#1e293b',
		mode: 'dark',
	},
	{
		id: 'monochrome',
		name: 'Carbon Minimal',
		desc: 'Pure high-contrast carbon noir aesthetic',
		bg: '#121212',
		card: '#1e1e1e',
		border: '#2a2a2a',
		mode: 'dark',
	},
	{
		id: 'light',
		name: 'Cloud Light',
		desc: 'Clean, crisp, high-contrast light workspace',
		bg: '#f8fafc',
		card: '#ffffff',
		border: '#e2e8f0',
		mode: 'light',
	},
]

const ACCENT_COLORS = [
	{ id: 'indigo', name: 'Indigo', color: '#6366f1', secondary: '#38bdf8' },
	{ id: 'sky', name: 'Sky Cyan', color: '#0ea5e9', secondary: '#38bdf8' },
	{ id: 'emerald', name: 'Emerald', color: '#10b981', secondary: '#34d399' },
	{ id: 'violet', name: 'Violet', color: '#8b5cf6', secondary: '#c084fc' },
	{ id: 'amber', name: 'Amber', color: '#f59e0b', secondary: '#fbbf24' },
]

export default function Settings() {
	const [store, setStore] = createLocalStore()
	const [activeTab, setActiveTab] = createSignal('appearance')
	const [systemInfo, setSystemInfo] = createSignal(null)
	const [loadingSysInfo, setLoadingSysInfo] = createSignal(false)
	const [purgingCache, setPurgingCache] = createSignal(false)
	const [testingTelegram, setTestingTelegram] = createSignal(false)
	const [telegramResults, setTelegramResults] = createSignal([])
	const [statusMessage, setStatusMessage] = createSignal(null)
	const [errorMessage, setErrorMessage] = createSignal(null)

	const isAdmin = createMemo(() => store.user && store.user.role === 'admin')
	const currentTheme = () => store.themeMode || 'midnight'
	const currentAccent = () => store.accentColor || 'indigo'

	const selectTheme = (themeId) => {
		setStore('themeMode', themeId)
		if (typeof document !== 'undefined') {
			document.documentElement.setAttribute('data-theme', themeId)
			const theme = THEME_OPTIONS.find((t) => t.id === themeId)
			if (theme) {
				document.documentElement.style.setProperty('--bg-default', theme.bg)
				document.documentElement.style.setProperty('--bg-paper', theme.card)
				document.documentElement.style.setProperty('--border-divider', theme.border)
				document.body.style.backgroundColor = theme.bg
			}
		}
		const opt = THEME_OPTIONS.find((t) => t.id === themeId)
		setStatusMessage(`Applied ${opt?.name || themeId} theme`)
		setTimeout(() => setStatusMessage(null), 3000)
	}

	const selectAccent = (accentId) => {
		setStore('accentColor', accentId)
		const accent = ACCENT_COLORS.find((a) => a.id === accentId)
		if (accent && typeof document !== 'undefined') {
			document.documentElement.setAttribute('data-accent', accentId)
			document.documentElement.style.setProperty('--primary-main', accent.color)
			document.documentElement.style.setProperty('--primary-hover', accent.color)
			document.documentElement.style.setProperty('--secondary-main', accent.secondary)
			document.documentElement.style.setProperty('--action-selected', `${accent.color}25`)
		}
		setStatusMessage(`Applied ${accent?.name || accentId} accent color`)
		setTimeout(() => setStatusMessage(null), 3000)
	}

	const toggleAutoPreview = (e) => {
		setStore('autoPreviewMedia', e.target.checked)
	}

	const toggleCompactMode = (e) => {
		setStore('compactMode', e.target.checked)
	}

	const setConcurrency = (_, value) => {
		setStore('chunkConcurrency', value)
	}

	const fetchSystemInfo = async () => {
		if (!isAdmin()) return
		setLoadingSysInfo(true)
		setErrorMessage(null)
		try {
			const res = await API.admin.getSystemInfo()
			if (res.error) {
				setErrorMessage(res.error)
			} else {
				setSystemInfo(res)
			}
		} catch (err) {
			setErrorMessage(err.message || 'Failed to fetch diagnostics')
		} finally {
			setLoadingSysInfo(false)
		}
	}

	const handlePurgeCache = async () => {
		if (!confirm('Purge local chunk cache? Chunks will safely stream from Telegram nodes as needed.')) {
			return
		}
		setPurgingCache(true)
		setErrorMessage(null)
		try {
			const res = await API.admin.clearCache()
			if (res.error) {
				setErrorMessage(res.error)
			} else {
				setStatusMessage(`Local cache purged: ${res.purged_chunks} chunks freed`)
				fetchSystemInfo()
			}
		} catch (err) {
			setErrorMessage(err.message || 'Failed to purge cache')
		} finally {
			setPurgingCache(false)
		}
	}

	const handleTestTelegram = async () => {
		setTestingTelegram(true)
		setErrorMessage(null)
		try {
			const res = await API.admin.testTelegramWorkers()
			if (res.error) {
				setErrorMessage(res.error)
			} else {
				setTelegramResults(res.results || [])
				setStatusMessage('Telegram node health check complete')
			}
		} catch (err) {
			setErrorMessage(err.message || 'Telegram test failed')
		} finally {
			setTestingTelegram(false)
		}
	}

	const handleDownloadBackup = () => {
		const token = store.access_token
		window.open(`/api/system/backup?token=${token}`, '_blank')
	}

	onMount(() => {
		if (isAdmin()) {
			fetchSystemInfo()
		}
	})

	return (
		<Box sx={{ maxWidth: '1080px', mx: 'auto', p: { xs: 2, md: 3 } }}>
			{/* Header */}
			<Box sx={{ mb: 3 }}>
				<Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.02em', mb: 0.5 }}>
					Settings & Preferences
				</Typography>
				<Typography variant="body2" sx={{ color: 'text.secondary' }}>
					Personalize interface appearance, configure streaming parameters, and manage system operations.
				</Typography>
			</Box>

			{/* Status Alerts */}
			<Show when={statusMessage()}>
				<Alert severity="success" sx={{ mb: 2.5 }} onClose={() => setStatusMessage(null)}>
					{statusMessage()}
				</Alert>
			</Show>
			<Show when={errorMessage()}>
				<Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setErrorMessage(null)}>
					{errorMessage()}
				</Alert>
			</Show>

			{/* Tab Nav Buttons */}
			<Box sx={{ display: 'flex', gap: 1, mb: 3, borderBottom: '1px solid', borderColor: 'divider', pb: 1.5 }}>
				<Button
					variant={activeTab() === 'appearance' ? 'contained' : 'text'}
					onClick={() => setActiveTab('appearance')}
					startIcon={<PaletteOutlined />}
					size="small"
					sx={{ borderRadius: '8px', textTransform: 'none', px: 2 }}
				>
					Appearance & Themes
				</Button>
				<Button
					variant={activeTab() === 'general' ? 'contained' : 'text'}
					onClick={() => setActiveTab('general')}
					startIcon={<SpeedOutlined />}
					size="small"
					sx={{ borderRadius: '8px', textTransform: 'none', px: 2 }}
				>
					Streaming & General
				</Button>
				<Show when={isAdmin()}>
					<Button
						variant={activeTab() === 'admin' ? 'contained' : 'text'}
						onClick={() => {
							setActiveTab('admin')
							fetchSystemInfo()
						}}
						startIcon={<AdminPanelSettingsOutlined />}
						size="small"
						color="secondary"
						sx={{ borderRadius: '8px', textTransform: 'none', px: 2 }}
					>
						Admin Infrastructure
					</Button>
				</Show>
			</Box>

			{/* TAB 1: APPEARANCE & THEMES */}
			<Show when={activeTab() === 'appearance'}>
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
					{/* Theme Selection */}
					<Card variant="outlined" sx={{ borderRadius: '12px' }}>
						<CardContent sx={{ p: 3 }}>
							<Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
								Workspace Theme
							</Typography>
							<Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5 }}>
								Choose a theme tailored for your environment.
							</Typography>

							<Grid container spacing={2}>
								<For each={THEME_OPTIONS}>
									{(item) => (
										<Grid item xs={12} sm={6}>
											<Box
												onClick={() => selectTheme(item.id)}
												sx={{
													p: 2,
													borderRadius: '10px',
													border: '2px solid',
													borderColor: currentTheme() === item.id ? 'var(--primary-main)' : 'divider',
													bgcolor: item.card,
													color: item.mode === 'light' ? '#0f172a' : '#f8fafc',
													cursor: 'pointer',
													transition: 'all 0.15s ease-in-out',
													position: 'relative',
													'&:hover': {
														borderColor: currentTheme() === item.id ? 'var(--primary-main)' : 'text.secondary',
													},
												}}
											>
												<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
													<Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
														{item.name}
													</Typography>
													<Show when={currentTheme() === item.id}>
														<Chip
															label="Active"
															size="small"
															color="primary"
															icon={<Check sx={{ fontSize: '14px !important' }} />}
															sx={{ height: '22px', fontSize: '0.75rem', fontWeight: 600 }}
														/>
													</Show>
												</Box>
												<Typography sx={{ fontSize: '0.8rem', opacity: 0.75 }}>
													{item.desc}
												</Typography>
												<Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
													<Box sx={{ width: 24, height: 16, borderRadius: '4px', bgcolor: item.bg, border: '1px solid rgba(128,128,128,0.3)' }} />
													<Box sx={{ width: 24, height: 16, borderRadius: '4px', bgcolor: item.card, border: '1px solid rgba(128,128,128,0.3)' }} />
												</Box>
											</Box>
										</Grid>
									)}
								</For>
							</Grid>
						</CardContent>
					</Card>

					{/* Accent Color Selection */}
					<Card variant="outlined" sx={{ borderRadius: '12px' }}>
						<CardContent sx={{ p: 3 }}>
							<Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
								Accent Color
							</Typography>
							<Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5 }}>
								Primary accent highlight applied across active items, badges, and buttons.
							</Typography>

							<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
								<For each={ACCENT_COLORS}>
									{(accent) => (
										<Box
											onClick={() => selectAccent(accent.id)}
											sx={{
												display: 'flex',
												alignItems: 'center',
												gap: 1.2,
												px: 2,
												py: 1,
												borderRadius: '20px',
												border: '1.5px solid',
												borderColor: currentAccent() === accent.id ? accent.color : 'divider',
												bgcolor: currentAccent() === accent.id ? `${accent.color}20` : 'transparent',
												cursor: 'pointer',
												transition: 'all 0.15s ease',
												'&:hover': {
													borderColor: accent.color,
													bgcolor: `${accent.color}10`,
												},
											}}
										>
											<Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: accent.color }} />
											<Typography variant="body2" sx={{ fontWeight: currentAccent() === accent.id ? 600 : 400 }}>
												{accent.name}
											</Typography>
											<Show when={currentAccent() === accent.id}>
												<Check sx={{ fontSize: 16, color: accent.color }} />
											</Show>
										</Box>
									)}
								</For>
							</Box>
						</CardContent>
					</Card>
				</Box>
			</Show>

			{/* TAB 2: STREAMING & GENERAL SETTINGS */}
			<Show when={activeTab() === 'general'}>
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
					{/* User Profile Card */}
					<Card variant="outlined" sx={{ borderRadius: '12px' }}>
						<CardContent sx={{ p: 3 }}>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
								<Box
									sx={{
										width: 44,
										height: 44,
										borderRadius: '50%',
										bgcolor: 'primary.main',
										color: '#fff',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										fontWeight: 700,
										fontSize: '1.1rem',
									}}
								>
									{store.user?.email ? store.user.email[0].toUpperCase() : 'U'}
								</Box>
								<Box>
									<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
										{store.user?.email || 'User Account'}
									</Typography>
									<Box sx={{ display: 'flex', gap: 1, mt: 0.2 }}>
										<Chip
											label={store.user?.role === 'admin' ? 'Administrator' : 'Standard Member'}
											size="small"
											color={store.user?.role === 'admin' ? 'secondary' : 'default'}
											sx={{ height: '20px', fontSize: '0.7rem', fontWeight: 600 }}
										/>
									</Box>
								</Box>
							</Box>
						</CardContent>
					</Card>

					{/* File Streaming & Upload Preferences */}
					<Card variant="outlined" sx={{ borderRadius: '12px' }}>
						<CardContent sx={{ p: 3 }}>
							<Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
								Streaming & Transfer Performance
							</Typography>
							<Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5 }}>
								Fine-tune media range streaming and parallel chunk uploads.
							</Typography>

							<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
								<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
									<Box>
										<Typography variant="body2" sx={{ fontWeight: 600 }}>
											Instant In-Browser Media Preview
										</Typography>
										<Typography variant="caption" sx={{ color: 'text.secondary' }}>
											Automatically stream video and audio files in full resolution on click.
										</Typography>
									</Box>
									<Switch
										checked={store.autoPreviewMedia !== false}
										onChange={toggleAutoPreview}
										color="primary"
									/>
								</Box>

								<Divider />

								<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
									<Box>
										<Typography variant="body2" sx={{ fontWeight: 600 }}>
											Compact List Layout
										</Typography>
										<Typography variant="caption" sx={{ color: 'text.secondary' }}>
											Dense file listings for large directory vaults.
										</Typography>
									</Box>
									<Switch
										checked={Boolean(store.compactMode)}
										onChange={toggleCompactMode}
										color="primary"
									/>
								</Box>

								<Divider />

								<Box>
									<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
										<Typography variant="body2" sx={{ fontWeight: 600 }}>
											Parallel Upload Streams
										</Typography>
										<Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
											{store.chunkConcurrency || 4} concurrent chunks
										</Typography>
									</Box>
									<Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
										Higher values speed up large multi-gigabyte uploads over fast connections.
									</Typography>
									<Box sx={{ display: 'flex', gap: 1 }}>
										<For each={[1, 2, 4, 6, 8]}>
											{(num) => (
												<Button
													size="small"
													variant={(store.chunkConcurrency || 4) === num ? 'contained' : 'outlined'}
													onClick={() => setConcurrency(null, num)}
													sx={{ minWidth: '42px', borderRadius: '6px', fontWeight: 600 }}
												>
													{num}x
												</Button>
											)}
										</For>
									</Box>
								</Box>
							</Box>
						</CardContent>
					</Card>
				</Box>
			</Show>

			{/* TAB 3: ADMIN-ONLY INFRASTRUCTURE SETTINGS */}
			<Show when={activeTab() === 'admin' && isAdmin()}>
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
					{/* System Diagnostics */}
					<Card variant="outlined" sx={{ borderRadius: '12px' }}>
						<CardContent sx={{ p: 3 }}>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
								<Box>
									<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
										Engine Status & Cryptographic Core
									</Typography>
									<Typography variant="body2" sx={{ color: 'text.secondary' }}>
										Hardware runtime, encryption engine, and active state.
									</Typography>
								</Box>
								<Button
									startIcon={<RefreshOutlined />}
									onClick={fetchSystemInfo}
									disabled={loadingSysInfo()}
									size="small"
									variant="outlined"
								>
									Refresh
								</Button>
							</Box>

							<Show when={loadingSysInfo()}>
								<LinearProgress sx={{ mb: 2 }} />
							</Show>

							<Show when={systemInfo()}>
								<Grid container spacing={2}>
									<Grid item xs={12} sm={6} md={3}>
										<Box sx={{ p: 2, borderRadius: '8px', bgcolor: 'action.hover' }}>
											<Typography variant="caption" sx={{ color: 'text.secondary' }}>Database Mode</Typography>
											<Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
												{systemInfo().database_mode}
											</Typography>
										</Box>
									</Grid>
									<Grid item xs={12} sm={6} md={3}>
										<Box sx={{ p: 2, borderRadius: '8px', bgcolor: 'action.hover' }}>
											<Typography variant="caption" sx={{ color: 'text.secondary' }}>Encryption Spec</Typography>
											<Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
												AES-256-GCM (NIST)
											</Typography>
										</Box>
									</Grid>
									<Grid item xs={12} sm={6} md={3}>
										<Box sx={{ p: 2, borderRadius: '8px', bgcolor: 'action.hover' }}>
											<Typography variant="caption" sx={{ color: 'text.secondary' }}>Cached Chunks</Typography>
											<Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
												{systemInfo().cached_chunks_count} ({((systemInfo().cached_chunks_bytes || 0) / (1024 * 1024)).toFixed(1)} MB)
											</Typography>
										</Box>
									</Grid>
									<Grid item xs={12} sm={6} md={3}>
										<Box sx={{ p: 2, borderRadius: '8px', bgcolor: 'action.hover' }}>
											<Typography variant="caption" sx={{ color: 'text.secondary' }}>Server Uptime</Typography>
											<Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
												{Math.floor(systemInfo().uptime_seconds / 60)} min
											</Typography>
										</Box>
									</Grid>
								</Grid>
							</Show>
						</CardContent>
					</Card>

					{/* Telegram MTProto Worker Node Diagnostic */}
					<Card variant="outlined" sx={{ borderRadius: '12px' }}>
						<CardContent sx={{ p: 3 }}>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
								<Box>
									<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
										Telegram MTProto Worker Gateways
									</Typography>
									<Typography variant="body2" sx={{ color: 'text.secondary' }}>
										Verify connectivity and measure API ping latency across all bot worker nodes.
									</Typography>
								</Box>
								<Button
									startIcon={<SendOutlined />}
									onClick={handleTestTelegram}
									disabled={testingTelegram()}
									variant="contained"
									size="small"
								>
									{testingTelegram() ? 'Testing...' : 'Ping All Workers'}
								</Button>
							</Box>

							<Show when={telegramResults().length > 0}>
								<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}>
									<For each={telegramResults()}>
										{(w) => (
											<Box
												sx={{
													p: 1.5,
													borderRadius: '8px',
													border: '1px solid',
													borderColor: 'divider',
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'space-between',
												}}
											>
												<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
													<CheckCircleOutlined
														color={w.status === 'active' ? 'success' : 'action'}
														sx={{ fontSize: 20 }}
													/>
													<Box>
														<Typography variant="body2" sx={{ fontWeight: 600 }}>
															{w.name} {w.username ? `(@${w.username})` : ''}
														</Typography>
														<Typography variant="caption" sx={{ color: 'text.secondary' }}>
															{w.message}
														</Typography>
													</Box>
												</Box>
												<Show when={w.latency_ms > 0}>
													<Chip
														label={`${w.latency_ms}ms`}
														size="small"
														color={w.latency_ms < 600 ? 'success' : 'warning'}
														sx={{ height: '22px', fontSize: '0.75rem', fontWeight: 600 }}
													/>
												</Show>
											</Box>
										)}
									</For>
								</Box>
							</Show>
						</CardContent>
					</Card>

					{/* Cache Management & Disaster Recovery */}
					<Card variant="outlined" sx={{ borderRadius: '12px' }}>
						<CardContent sx={{ p: 3 }}>
							<Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
								Storage Cache & State Backup
							</Typography>
							<Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5 }}>
								Manage disk cache and export portable snapshots of all vaults and keys.
							</Typography>

							<Grid container spacing={2}>
								<Grid item xs={12} sm={6}>
									<Box sx={{ p: 2, borderRadius: '8px', border: '1px solid', borderColor: 'divider' }}>
										<Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
											Local Chunk Disk Cache
										</Typography>
										<Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
											Purging clears local decrypted staging cache. Chunks are automatically fetched from Telegram MTProto when requested.
										</Typography>
										<Button
											variant="outlined"
											color="error"
											size="small"
											startIcon={<DeleteSweepOutlined />}
											onClick={handlePurgeCache}
											disabled={purgingCache()}
										>
											{purgingCache() ? 'Purging...' : 'Purge Disk Cache'}
										</Button>
									</Box>
								</Grid>
								<Grid item xs={12} sm={6}>
									<Box sx={{ p: 2, borderRadius: '8px', border: '1px solid', borderColor: 'divider' }}>
										<Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
											Full System Snapshot Backup
										</Typography>
										<Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
											Download an encrypted snapshot containing all storage maps, user accounts, and chunk index trees.
										</Typography>
										<Button
											variant="outlined"
											color="primary"
											size="small"
											startIcon={<CloudDownloadOutlined />}
											onClick={handleDownloadBackup}
										>
											Download State JSON
										</Button>
									</Box>
								</Grid>
							</Grid>
						</CardContent>
					</Card>
				</Box>
			</Show>
		</Box>
	)
}
