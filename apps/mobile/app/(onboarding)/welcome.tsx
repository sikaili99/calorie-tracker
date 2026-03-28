import React from "react"
import { View, StyleSheet } from "react-native"
import { router } from "expo-router"
import { useThemeColor } from "@/hooks/useThemeColor"
import { ThemedText } from "@/components/ThemedText"
import { CustomPressable } from "@/components/CustomPressable"
import Ionicons from "@expo/vector-icons/Ionicons"
import { borderRadius } from "@/constants/Theme"

export default function WelcomeScreen() {
	const theme = useThemeColor()

	const styles = StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: theme.background,
			alignItems: "center",
			justifyContent: "center",
			padding: 32,
			gap: 16,
		},
		iconContainer: {
			width: 96,
			height: 96,
			borderRadius: 48,
			backgroundColor: theme.primary + "20",
			alignItems: "center",
			justifyContent: "center",
			marginBottom: 8,
		},
		button: {
			backgroundColor: theme.primary,
			paddingVertical: 16,
			paddingHorizontal: 32,
			borderRadius,
			alignItems: "center",
			marginTop: 24,
			width: "100%",
		},
	})

	return (
		<View style={styles.container}>
			<View style={styles.iconContainer}>
				<Ionicons name="nutrition-outline" size={48} color={theme.primary} />
			</View>
			<ThemedText type="title" centered>
				Simple Calorie Tracker
			</ThemedText>
			<ThemedText type="subtitleLight" centered>
				Track your nutrition, reach your goals, and feel your best.
			</ThemedText>
			<CustomPressable
				borderRadius={borderRadius}
				style={styles.button}
				onPress={() => router.push("/(onboarding)/auth-choice")}
			>
				<ThemedText type="defaultSemiBold" color={theme.background}>
					Get Started
				</ThemedText>
			</CustomPressable>
		</View>
	)
}
