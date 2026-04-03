/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from "@/constants/Theme"
import { useSettings } from "@/providers/SettingsProvider"
import { useColorScheme } from "react-native"

export function useResolvedColorScheme(): "light" | "dark" {
	const systemColorScheme = useColorScheme()
	const { themeMode } = useSettings()

	if (themeMode === "system") {
		return systemColorScheme === "dark" ? "dark" : "light"
	}

	return themeMode
}

export function useThemeColor() {
	const colorScheme = useResolvedColorScheme()
	return colorScheme === "dark" ? Colors.dark : Colors.light
}
