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
			paddingHorizontal: 24,
			paddingVertical: 28,
		},
		ornamentTop: {
			position: "absolute",
			top: -70,
			right: -40,
			width: 190,
			height: 190,
			borderRadius: 95,
			backgroundColor: theme.primaryAlpha20,
		},
		ornamentBottom: {
			position: "absolute",
			bottom: -80,
			left: -55,
			width: 210,
			height: 210,
			borderRadius: 105,
			backgroundColor: theme.primaryAlpha20,
		},
		content: {
			flex: 1,
			justifyContent: "center",
			gap: 16,
		},
		iconContainer: {
			width: 104,
			height: 104,
			borderRadius: 52,
			backgroundColor: theme.primaryAlpha20,
			alignItems: "center",
			justifyContent: "center",
			borderWidth: 1,
			borderColor: theme.primaryAlpha33,
			marginBottom: 4,
			alignSelf: "center",
		},
		description: {
			maxWidth: 320,
			alignSelf: "center",
		},
		highlights: {
			gap: 10,
			marginTop: 4,
		},
		highlightRow: {
			flexDirection: "row",
			alignItems: "center",
			gap: 10,
			backgroundColor: theme.surface,
			borderRadius: borderRadius,
			paddingHorizontal: 12,
			paddingVertical: 10,
			borderWidth: 1,
			borderColor: theme.onSurface,
		},
		button: {
			backgroundColor: theme.primary,
			paddingVertical: 16,
			paddingHorizontal: 32,
			borderRadius,
			alignItems: "center",
			width: "100%",
		},
		linkButton: {
			paddingVertical: 10,
			alignItems: "center",
		},
	})

	return (
		<View style={styles.container}>
			<View style={styles.ornamentTop} />
			<View style={styles.ornamentBottom} />
			<View style={styles.content}>
				<View style={styles.iconContainer}>
					<Ionicons
						name="nutrition-outline"
						size={48}
						color={theme.primary}
					/>
				</View>
				<ThemedText type="title" centered>
					Calorie Tracker
				</ThemedText>
				<ThemedText
					type="subtitleLight"
					centered
					style={styles.description}
				>
					Track meals, hit your goals, and build better nutrition
					habits one day at a time.
				</ThemedText>

				<View style={styles.highlights}>
					<View style={styles.highlightRow}>
						<Ionicons
							name="checkmark-circle-outline"
							size={18}
							color={theme.primary}
						/>
						<ThemedText type="subtitleLight">
							Personalized calorie and macro targets
						</ThemedText>
					</View>
					<View style={styles.highlightRow}>
						<Ionicons
							name="checkmark-circle-outline"
							size={18}
							color={theme.primary}
						/>
						<ThemedText type="subtitleLight">
							AI-powered food search and coaching
						</ThemedText>
					</View>
				</View>

				<CustomPressable
					borderRadius={borderRadius}
					style={styles.button}
					onPress={() => router.push("/(onboarding)/auth-choice")}
					testID="welcome-get-started"
				>
					<ThemedText type="defaultSemiBold" color={theme.background}>
						Get Started
					</ThemedText>
				</CustomPressable>

				<CustomPressable
					borderRadius={borderRadius}
					style={styles.linkButton}
					onPress={() => router.push("/(onboarding)/login")}
				>
					<ThemedText type="subtitleLight" color={theme.primary}>
						I already have an account
					</ThemedText>
				</CustomPressable>
			</View>
		</View>
	)
}
