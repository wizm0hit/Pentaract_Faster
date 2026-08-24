import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import suidPlugin from '@suid/vite-plugin'

export default defineConfig({
	plugins: [suidPlugin(), solidPlugin()],
	server: {
		host: '0.0.0.0',
		port: 3000,
	},
	build: {
		target: 'esnext',
	},
})
