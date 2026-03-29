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
import { useAuth } from "@/providers/AuthProvider"
import { useSettings } from "@/providers/SettingsProvider"
import { borderRadius } from "@/constants/Theme"
import Ionicons from "@expo/vector-icons/Ionicons"

export default function LoginScreen() {
	const theme = useThemeColor()
	const { login, loginWithGoogle } = useAuth()
	const { updateOnboardingComplete } = useSettings()
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [error, setError] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [isGoogleLoading, setIsGoogleLoading] = useState(false)

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
		googleButton: {
			backgroundColor: theme.surface,
			paddingVertical: 16,
			borderRadius,
			alignItems: "center",
			flexDirection: "row",
			justifyContent: "center",
			gap: 10,
		},
		dividerRow: {
			flexDirection: "row",
			alignItems: "center",
			gap: 12,
			marginVertical: 4,
		},
		dividerLine: {
			flex: 1,
			height: StyleSheet.hairlineWidth,
			backgroundColor: theme.onSurface,
		},
		linkButton: {
			paddingVertical: 12,
			alignItems: "center",
		},
		guestButton: {
			paddingVertical: 16,
			borderRadius,
			alignItems: "center",
			borderWidth: StyleSheet.hairlineWidth,
			borderColor: theme.onSurface,
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
			await login(email.trim(), password)
			router.replace("/(tabs)")
		} catch (e: any) {
			setError(e?.response?.data?.message ?? "Invalid email or password.")
		} finally {
			setIsLoading(false)
		}
	}

	const handleGoogleLogin = async () => {
		setIsGoogleLoading(true)
		setError(null)
		try {
			await loginWithGoogle()
			router.replace("/(tabs)")
		} catch (e: any) {
			if (e?.message !== "Dismissed") {
				setError("Google sign-in failed. Please try again.")
			}
		} finally {
			setIsGoogleLoading(false)
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
					<ThemedText type="subtitleLight" color={theme.error}>
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

				<View style={styles.dividerRow}>
					<View style={styles.dividerLine} />
					<ThemedText type="subtitleLight">or</ThemedText>
					<View style={styles.dividerLine} />
				</View>

				<CustomPressable
					borderRadius={borderRadius}
					style={styles.googleButton}
					onPress={handleGoogleLogin}
					disabled={isGoogleLoading}
				>
					<Ionicons name="logo-google" size={20} color={theme.text} />
					<ThemedText type="defaultSemiBold">
						{isGoogleLoading ? "Signing in…" : "Continue with Google"}
					</ThemedText>
				</CustomPressable>

				<CustomPressable
					borderRadius={borderRadius}
					style={styles.guestButton}
					onPress={handleContinueAsGuest}
				>
					<ThemedText type="default">Continue as Guest</ThemedText>
				</CustomPressable>

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
