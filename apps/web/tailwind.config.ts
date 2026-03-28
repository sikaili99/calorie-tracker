import type { Config } from "tailwindcss"

const config: Config = {
	content: ["./app/**/*.{ts,tsx}"],
	theme: {
		extend: {
			colors: {
				primary: "#5BBEF9",
				"bg-dark": "#111928",
				"bg-light": "#F8FAFC",
				surface: "#1B2232",
			},
			fontFamily: {
				sans: ["Inter", "system-ui", "sans-serif"],
			},
		},
	},
	plugins: [],
}

export default config
