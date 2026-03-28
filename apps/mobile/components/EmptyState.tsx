import React, { useMemo } from "react"
import { StyleSheet, View, ViewStyle } from "react-native"
import { useThemeColor } from "@/hooks/useThemeColor"
import { ThemedText } from "@/components/ThemedText"
import { spacing } from "@/constants/Theme"
import Ionicons from "@expo/vector-icons/Ionicons"

type EmptyStateProps = {
	iconName: React.ComponentProps<typeof Ionicons>["name"]
	title: string
	subtitle: string
	style?: ViewStyle
}

export const EmptyState = ({
	iconName,
	title,
	subtitle,
	style,
}: EmptyStateProps) => {
	const theme = useThemeColor()

	const styles = useMemo(
		() =>
			StyleSheet.create({
				container: {
					flex: 1,
					alignItems: "center",
					justifyContent: "center",
					padding: spacing.xl,
					gap: spacing.md,
				},
				iconCircle: {
					width: 64,
					height: 64,
					borderRadius: 32,
					backgroundColor: theme.surface,
					alignItems: "center",
					justifyContent: "center",
				},
			}),
		[theme.surface]
	)

	return (
		<View style={[styles.container, style]}>
			<View style={styles.iconCircle}>
				<Ionicons name={iconName} size={32} color={theme.primary} />
			</View>
			<ThemedText type="defaultSemiBold" centered>
				{title}
			</ThemedText>
			<ThemedText type="subtitleLight" centered>
				{subtitle}
			</ThemedText>
		</View>
	)
}
