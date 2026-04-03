import React from "react"
import { View, StyleSheet } from "react-native"
import { router } from "expo-router"
import { useThemeColor } from "@/hooks/useThemeColor"
import { ThemedText } from "@/components/ThemedText"
import { CustomPressable } from "@/components/CustomPressable"
import { borderRadius } from "@/constants/Theme"
import Ionicons from "@expo/vector-icons/Ionicons"

export default function AuthChoiceScreen() {
	const theme = useThemeColor()

	const styles = StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: theme.background,
			padding: 24,
			justifyContent: "space-between",
			paddingTop: 56,
			paddingBottom: 32,
		},
		headerBlock: {
			gap: 12,
		},
		card: {
			backgroundColor: theme.surface,
			borderRadius: 16,
			padding: 20,
			gap: 16,
			borderWidth: 1,
			borderColor: theme.onSurface,
		},
		headerRow: {
			flexDirection: "row",
			alignItems: "center",
			gap: 12,
		},
		iconCircle: {
			width: 44,
			height: 44,
			borderRadius: 22,
			backgroundColor: theme.primaryAlpha20,
			alignItems: "center",
			justifyContent: "center",
		},
		primaryButton: {
			backgroundColor: theme.primary,
			paddingVertical: 16,
			borderRadius,
			alignItems: "center",
			minHeight: 52,
		},
		secondaryButton: {
			backgroundColor: theme.background,
			paddingVertical: 16,
			borderRadius,
			alignItems: "center",
			borderWidth: 1,
			borderColor: theme.onSurface,
			minHeight: 52,
		},
		bulletRow: {
			flexDirection: "row",
			alignItems: "center",
			gap: 8,
		},
		guestButton: {
			paddingVertical: 12,
			alignItems: "center",
		},
		subtleDivider: {
			height: StyleSheet.hairlineWidth,
			backgroundColor: theme.onSurface,
			marginVertical: 4,
		},
	})

	return (
		<View style={styles.container}>
			<View style={styles.headerBlock}>
				<ThemedText type="title">Let&apos;s get you set up</ThemedText>
				<ThemedText type="subtitleLight">
					Create an account to sync across devices, or continue as
					guest and set it up later.
				</ThemedText>
			</View>

			<View style={{ gap: 16 }}>
				<View style={styles.card}>
					<View style={styles.headerRow}>
						<View style={styles.iconCircle}>
							<Ionicons
								name="sparkles-outline"
								size={20}
								color={theme.primary}
							/>
						</View>
						<View style={{ flex: 1 }}>
							<ThemedText type="defaultSemiBold">
								Start your personalized plan
							</ThemedText>
							<ThemedText type="subtitleLight">
								Choose how you want to continue
							</ThemedText>
						</View>
					</View>

					<View style={styles.bulletRow}>
						<Ionicons
							name="checkmark-circle"
							size={16}
							color={theme.primary}
						/>
						<ThemedText type="subtitleLight">
							Sync your diary and preferences
						</ThemedText>
					</View>
					<View style={styles.bulletRow}>
						<Ionicons
							name="checkmark-circle"
							size={16}
							color={theme.primary}
						/>
						<ThemedText type="subtitleLight">
							Get AI guidance with your saved data
						</ThemedText>
					</View>

					<CustomPressable
						borderRadius={borderRadius}
						style={styles.primaryButton}
						onPress={() => router.push("/(onboarding)/register")}
						testID="auth-choice-create-account"
					>
						<ThemedText
							type="defaultSemiBold"
							color={theme.background}
						>
							Create Account
						</ThemedText>
					</CustomPressable>

					<CustomPressable
						borderRadius={borderRadius}
						style={styles.secondaryButton}
						onPress={() => router.push("/(onboarding)/login")}
						testID="auth-choice-signin"
					>
						<ThemedText type="defaultSemiBold">Sign In</ThemedText>
					</CustomPressable>

					<View style={styles.subtleDivider} />

					<CustomPressable
						borderRadius={borderRadius}
						style={styles.guestButton}
						onPress={() => router.push("/(onboarding)/goal-wizard")}
						testID="auth-choice-guest"
					>
						<ThemedText type="subtitleLight" color={theme.primary}>
							Continue as Guest
						</ThemedText>
					</CustomPressable>
				</View>
			</View>
		</View>
	)
}
