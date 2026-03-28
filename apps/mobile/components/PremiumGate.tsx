import React, { useMemo } from "react"
import { StyleSheet, View, ViewStyle } from "react-native"
import { router } from "expo-router"
import { useThemeColor } from "@/hooks/useThemeColor"
import { ThemedText } from "@/components/ThemedText"
import { PrimaryButton } from "@/components/PrimaryButton"
import { spacing } from "@/constants/Theme"
import Ionicons from "@expo/vector-icons/Ionicons"

type PremiumGateProps = {
	title: string
	description: string
	style?: ViewStyle
}

export const PremiumGate = ({ title, description, style }: PremiumGateProps) => {
	const theme = useThemeColor()

	const styles = useMemo(
		() =>
			StyleSheet.create({
				container: {
					flex: 1,
					alignItems: "center",
					justifyContent: "center",
					padding: spacing.xxl,
					gap: spacing.md,
				},
				iconCircle: {
					width: 80,
					height: 80,
					borderRadius: 40,
					backgroundColor: theme.primaryAlpha20,
					alignItems: "center",
					justifyContent: "center",
					marginBottom: spacing.sm,
				},
				button: {
					marginTop: spacing.sm,
					paddingHorizontal: spacing.xl,
					alignSelf: "stretch",
				},
			}),
		[theme.primaryAlpha20]
	)

	return (
		<View style={[styles.container, style]}>
			<View style={styles.iconCircle}>
				<Ionicons name="lock-closed-outline" size={36} color={theme.primary} />
			</View>
			<ThemedText type="defaultSemiBold" centered>
				{title}
			</ThemedText>
			<ThemedText type="subtitleLight" centered>
				{description}
			</ThemedText>
			<PrimaryButton
				label="Unlock Premium"
				onPress={() => router.push("/paywall")}
				style={styles.button}
			/>
		</View>
	)
}
