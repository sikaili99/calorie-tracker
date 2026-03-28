import React from "react"
import { View, StyleSheet } from "react-native"
import { router } from "expo-router"
import { useThemeColor } from "@/hooks/useThemeColor"
import { ThemedText } from "@/components/ThemedText"
import { CustomPressable } from "@/components/CustomPressable"
import { borderRadius } from "@/constants/Theme"

export default function AuthChoiceScreen() {
	const theme = useThemeColor()

	const styles = StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: theme.background,
			alignItems: "center",
			justifyContent: "center",
			padding: 32,
			gap: 12,
		},
		primaryButton: {
			backgroundColor: theme.primary,
			paddingVertical: 16,
			paddingHorizontal: 32,
			borderRadius,
			alignItems: "center",
			width: "100%",
		},
		secondaryButton: {
			backgroundColor: theme.surface,
			paddingVertical: 16,
			paddingHorizontal: 32,
			borderRadius,
			alignItems: "center",
			width: "100%",
		},
		linkButton: {
			paddingVertical: 12,
			alignItems: "center",
			width: "100%",
		},
		divider: {
			height: 1,
			backgroundColor: theme.surface,
			width: "100%",
			marginVertical: 4,
		},
	})

	return (
		<View style={styles.container}>
			<ThemedText type="title" centered>
				Welcome
			</ThemedText>
			<ThemedText type="subtitleLight" centered style={{ marginBottom: 16 }}>
				How would you like to continue?
			</ThemedText>

			<CustomPressable
				borderRadius={borderRadius}
				style={styles.primaryButton}
				onPress={() => router.push("/(onboarding)/register")}
			>
				<ThemedText type="defaultSemiBold" color={theme.background}>
					Create Account
				</ThemedText>
			</CustomPressable>

			<CustomPressable
				borderRadius={borderRadius}
				style={styles.secondaryButton}
				onPress={() => router.push("/(onboarding)/goal-wizard")}
			>
				<ThemedText type="defaultSemiBold">Continue as Guest</ThemedText>
			</CustomPressable>

			<View style={styles.divider} />

			<CustomPressable
				borderRadius={borderRadius}
				style={styles.linkButton}
				onPress={() => router.push("/(onboarding)/login")}
			>
				<ThemedText type="subtitleLight" color={theme.primary}>
					Already have an account? Sign In
				</ThemedText>
			</CustomPressable>
		</View>
	)
}
