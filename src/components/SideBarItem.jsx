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
						minHeight: 44,
						borderRadius: '8px',
						justifyContent: props.isFull ? 'initial' : 'center',
						px: 2,
						bgcolor: isActive() ? 'var(--action-selected)' : 'transparent',
						border: '1px solid',
						borderColor: isActive() ? 'var(--primary-main)' : 'transparent',
						color: isActive() ? 'var(--primary-main)' : 'text.secondary',
						transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
						'&:hover': {
							bgcolor: 'action.hover',
							color: 'text.primary',
						},
					}}
				>
					<ListItemIcon
						sx={{
							minWidth: 0,
							mr: props.isFull ? 2 : 'auto',
							justifyContent: 'center',
							color: isActive() ? 'var(--primary-main)' : 'text.secondary',
							'& svg': {
								fontSize: 20,
							},
						}}
					>
						{c()}
					</ListItemIcon>
					<ListItemText
						primary={props.text}
						primaryTypographyProps={{
							fontSize: 14,
							fontWeight: isActive() ? 600 : 500,
						}}
						sx={{ display: props.isFull ? 'block' : 'none' }}
					/>
				</ListItemButton>
			</A>
		</ListItem>
	)
}

export default SideBarItem
