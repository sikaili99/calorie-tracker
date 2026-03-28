import React, { useState } from "react"
import {
	View,
	StyleSheet,
	TextInput,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
} from "react-native"
import { router } from "expo-router"
import { useThemeColor } from "@/hooks/useThemeColor"
import { ThemedText } from "@/components/ThemedText"
import { CustomPressable } from "@/components/CustomPressable"
import { BackendAPI } from "@/api/BackendAPI"
import { useSettings } from "@/providers/SettingsProvider"
import { borderRadius } from "@/constants/Theme"

export default function LoginScreen() {
	const theme = useThemeColor()
	const { updateOnboardingComplete } = useSettings()
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [error, setError] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(false)

	const styles = StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: theme.background,
		},
		inner: {
			flexGrow: 1,
			padding: 32,
			justifyContent: "center",
			gap: 12,
		},
		input: {
			backgroundColor: theme.surface,
			borderRadius,
			paddingHorizontal: 16,
			paddingVertical: 14,
			color: theme.text,
			fontSize: 16,
		},
		primaryButton: {
			backgroundColor: theme.primary,
			paddingVertical: 16,
			borderRadius,
			alignItems: "center",
			marginTop: 8,
		},
		secondaryButton: {
			backgroundColor: theme.surface,
			paddingVertical: 16,
			borderRadius,
			alignItems: "center",
		},
		linkButton: {
			paddingVertical: 12,
			alignItems: "center",
		},
	})

	const handleSubmit = async () => {
		if (!email.trim() || !password.trim()) {
			setError("Please fill in all fields.")
			return
		}
		setIsLoading(true)
		setError(null)
		try {
			await BackendAPI.login(email.trim(), password)
			router.replace("/(tabs)")
		} catch {
			setError("Coming soon! Use 'Continue as Guest' to enter the app.")
		} finally {
			setIsLoading(false)
		}
	}

	const handleContinueAsGuest = async () => {
		await updateOnboardingComplete(true)
		router.replace("/(tabs)")
	}

	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior={Platform.OS === "ios" ? "padding" : "height"}
		>
			<ScrollView contentContainerStyle={styles.inner}>
				<ThemedText type="title">Sign In</ThemedText>
				<ThemedText type="subtitleLight" style={{ marginBottom: 8 }}>
					Welcome back.
				</ThemedText>

				<TextInput
					style={styles.input}
					placeholder="Email"
					placeholderTextColor={theme.text + "80"}
					value={email}
					onChangeText={setEmail}
					keyboardType="email-address"
					autoCapitalize="none"
				/>
				<TextInput
					style={styles.input}
					placeholder="Password"
					placeholderTextColor={theme.text + "80"}
					value={password}
					onChangeText={setPassword}
					secureTextEntry
				/>

				{error && (
					<ThemedText type="subtitleLight" color="#F59E0B">
						{error}
					</ThemedText>
				)}

				<CustomPressable
					borderRadius={borderRadius}
					style={styles.primaryButton}
					onPress={handleSubmit}
					disabled={isLoading}
				>
					<ThemedText type="defaultSemiBold" color={theme.background}>
						{isLoading ? "Signing in…" : "Sign In"}
					</ThemedText>
				</CustomPressable>

				{error && (
					<CustomPressable
						borderRadius={borderRadius}
						style={styles.secondaryButton}
						onPress={handleContinueAsGuest}
					>
						<ThemedText type="defaultSemiBold">
							Continue as Guest
						</ThemedText>
					</CustomPressable>
				)}

				<CustomPressable
					borderRadius={borderRadius}
					style={styles.linkButton}
					onPress={() => router.replace("/(onboarding)/register")}
				>
					<ThemedText type="subtitleLight" color={theme.primary}>
						Don't have an account? Create one
					</ThemedText>
				</CustomPressable>
			</ScrollView>
		</KeyboardAvoidingView>
	)
}
