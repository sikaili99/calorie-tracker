import React, { useMemo } from "react"
import { ActivityIndicator, StyleSheet, View, ViewStyle } from "react-native"
import { useThemeColor } from "@/hooks/useThemeColor"
import { ThemedText } from "@/components/ThemedText"
import { spacing } from "@/constants/Theme"

type LoadingStateProps = {
	message?: string
	style?: ViewStyle
}

export const LoadingState = ({ message, style }: LoadingStateProps) => {
	const theme = useThemeColor()

	const styles = useMemo(
		() =>
			StyleSheet.create({
				container: {
					flex: 1,
					justifyContent: "center",
					alignItems: "center",
					padding: spacing.xl,
				},
			}),
		[]
	)

	return (
		<View style={[styles.container, style]}>
			<ActivityIndicator size="large" color={theme.primary} />
			{message && (
				<ThemedText type="subtitleLight" style={{ marginTop: spacing.sm }}>
					{message}
				</ThemedText>
			)}
		</View>
	)
}
