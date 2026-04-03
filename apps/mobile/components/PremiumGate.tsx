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

export const PremiumGate = ({
	title,
	description,
	style,
}: PremiumGateProps) => {
	const theme = useThemeColor()

	const styles = useMemo(
		() =>
			StyleSheet.create({
				container: {
					flex: 1,
					alignItems: "center",
					justifyContent: "center",
					padding: spacing.xxl,
				},
				card: {
					backgroundColor: theme.surface,
					borderRadius: 16,
					padding: spacing.xl,
					gap: spacing.md,
					borderWidth: 1,
					borderColor: theme.onSurface,
					width: "100%",
					maxWidth: 420,
				},
				iconCircle: {
					width: 80,
					height: 80,
					borderRadius: 40,
					backgroundColor: theme.primaryAlpha20,
					alignItems: "center",
					justifyContent: "center",
					marginBottom: spacing.sm,
					alignSelf: "center",
				},
				bulletRow: {
					flexDirection: "row",
					alignItems: "center",
					gap: spacing.sm,
				},
				button: {
					marginTop: spacing.sm,
				},
			}),
		[theme.primaryAlpha20, theme.surface, theme.onSurface]
	)

	return (
		<View style={[styles.container, style]}>
			<View style={styles.card}>
				<View style={styles.iconCircle}>
					<Ionicons
						name="lock-closed-outline"
						size={36}
						color={theme.primary}
					/>
				</View>
				<ThemedText type="defaultSemiBold" centered>
					{title}
				</ThemedText>
				<ThemedText type="subtitleLight" centered>
					{description}
				</ThemedText>

				<View style={styles.bulletRow}>
					<Ionicons
						name="checkmark-circle"
						size={18}
						color={theme.primary}
					/>
					<ThemedText type="subtitleLight">
						7-day free trial
					</ThemedText>
				</View>
				<View style={styles.bulletRow}>
					<Ionicons
						name="checkmark-circle"
						size={18}
						color={theme.primary}
					/>
					<ThemedText type="subtitleLight">Cancel anytime</ThemedText>
				</View>

				<PrimaryButton
					label="Start Free Trial"
					onPress={() =>
						router.push({
							pathname: "/paywall",
							params: { featureName: title },
						})
					}
					style={styles.button}
				/>
			</View>
		</View>
	)
}
