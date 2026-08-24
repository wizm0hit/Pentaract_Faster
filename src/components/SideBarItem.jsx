import { A, useLocation } from '@solidjs/router'
import ListItem from '@suid/material/ListItem'
import ListItemButton from '@suid/material/ListItemButton'
import ListItemIcon from '@suid/material/ListItemIcon'
import ListItemText from '@suid/material/ListItemText'
import { children } from 'solid-js'

/**
 * @typedef {Object} SideBarItemProps
 * @property {string} text
 * @property {boolean} isFull
 * @property {string} link
 * @property {import("solid-js").JSXElement[]} children
 */

/**
 * @param {SideBarItemProps} props
 */
const SideBarItem = (props) => {
	const c = children(() => props.children)
	const location = useLocation()
	const isActive = () => {
		if (props.link === '/storages') {
			return location.pathname === '/' || location.pathname.startsWith('/storages')
		}
		return location.pathname.startsWith(props.link)
	}

	return (
		<ListItem disablePadding sx={{ display: 'block', mb: 0.5, px: 1 }}>
			<A href={props.link} style={{ textDecoration: 'none', color: 'inherit' }}>
				<ListItemButton
					sx={{
						minHeight: 46,
						borderRadius: 2,
						justifyContent: props.isFull ? 'initial' : 'center',
						px: 2,
						backgroundColor: isActive() ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
						border: isActive() ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
						color: isActive() ? '#818cf8' : '#94a3b8',
						transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
						'&:hover': {
							backgroundColor: isActive() ? 'rgba(99, 102, 241, 0.22)' : 'rgba(255, 255, 255, 0.05)',
							color: '#f8fafc',
						},
					}}
				>
					<ListItemIcon
						sx={{
							minWidth: 0,
							mr: props.isFull ? 2 : 'auto',
							justifyContent: 'center',
							color: isActive() ? '#818cf8' : '#94a3b8',
							'& svg': {
								fontSize: 22,
								filter: isActive() ? 'drop-shadow(0 0 6px rgba(99, 102, 241, 0.5))' : 'none',
							},
						}}
					>
						{c()}
					</ListItemIcon>
					<ListItemText
						primary={props.text}
						primaryTypographyProps={{
							fontSize: 14,
							fontWeight: isActive() ? 700 : 500,
						}}
						sx={{ display: props.isFull ? 'block' : 'none' }}
					/>
				</ListItemButton>
			</A>
		</ListItem>
	)
}

export default SideBarItem
