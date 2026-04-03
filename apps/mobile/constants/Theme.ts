/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { DefaultTheme, Theme } from "@react-navigation/native"

export const Colors = {
	light: {
		text: "#364750",
		icon: "#364750",
		background: "#F8FAFC",
		surface: "#FFFFFF",
		onSurface: "#F0F3F5",
		primary: "#5BBEF9",
		secondary: "#0889D6",
		info: "#5BBEF9",
		warning: "#F59E0B",
		bottomNav: "#FFFEFE",
		error: "#EF4444",
		errorSurface: "#FEF2F2",
		success: "#22C55E",
		macroCarbs: "#5BBEF9",
		macroProtein: "#22C55E",
		macroFat: "#F59E0B",
		primaryAlpha20: "#5BBEF920",
		primaryAlpha33: "#5BBEF933",
	},
	dark: {
		text: "#E1E3E1",
		icon: "#E1E3E1",
		background: "#111928",
		surface: "#1B2232",
		onSurface: "#343846",
		primary: "#5BBFF8",
		secondary: "#0989D8",
		info: "#5BBFF8",
		warning: "#FBBF24",
		bottomNav: "#202B38",
		error: "#F87171",
		errorSurface: "#3B1515",
		success: "#4ADE80",
		macroCarbs: "#5BBFF8",
		macroProtein: "#4ADE80",
		macroFat: "#FBBF24",
		primaryAlpha20: "#5BBFF820",
		primaryAlpha33: "#5BBFF833",
	},
}

export const borderRadius = 8

export const spacing = {
	xs: 4,
	sm: 8,
	md: 12,
	lg: 16,
	xl: 24,
	xxl: 32,
} as const

export const typography = {
	xs: 11,
	sm: 12,
	md: 15,
	base: 16,
	lg: 18,
	xl: 20,
} as const

export const paddingTopForHeader = 44

export const CustomDarkTheme: Theme = {
	dark: true,
	fonts: DefaultTheme.fonts,
	colors: {
		background: Colors.dark.background,
		primary: Colors.dark.primary,
		text: Colors.dark.text,
		card: Colors.dark.surface,
		border: Colors.dark.surface,
		notification: Colors.dark.primary,
	},
}

export const CustomLightTheme: Theme = {
	dark: false,
	fonts: DefaultTheme.fonts,
	colors: {
		background: Colors.light.background,
		primary: Colors.light.primary,
		text: Colors.light.text,
		card: Colors.light.surface,
		border: Colors.light.surface,
		notification: Colors.light.primary,
	},
}
