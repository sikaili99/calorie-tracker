import React, { useState } from "react"
import {
	View,
	StyleSheet,
	TextInput,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
} from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import { useThemeColor } from "@/hooks/useThemeColor"
import { ThemedText } from "@/components/ThemedText"
import { CustomPressable } from "@/components/CustomPressable"
import { useAuth } from "@/providers/AuthProvider"
import { useSettings } from "@/providers/SettingsProvider"
import { useDiarySync } from "@/hooks/useDiarySync"
import { borderRadius } from "@/constants/Theme"
import Ionicons from "@expo/vector-icons/Ionicons"

export default function LoginScreen() {
	const theme = useThemeColor()
	const { login, loginWithGoogle } = useAuth()
	const { updateOnboardingComplete } = useSettings()
	const { pullAll, pushPending } = useDiarySync()
	const { returnTo } = useLocalSearchParams<{ returnTo?: string }>()
	const returnToPath =
		typeof returnTo === "string" && returnTo.trim().length > 0
			? returnTo
			: undefined
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
			padding: 24,
			justifyContent: "space-between",
			paddingTop: 44,
			paddingBottom: 24,
			gap: 16,
		},
		headerBlock: {
			gap: 10,
		},
		titleRow: {
			flexDirection: "row",
			alignItems: "center",
			gap: 12,
		},
		iconCircle: {
			width: 58,
			height: 58,
			borderRadius: 29,
			backgroundColor: theme.primaryAlpha20,
			borderWidth: 1,
			borderColor: theme.primaryAlpha33,
			alignItems: "center",
			justifyContent: "center",
		},
		formCard: {
			backgroundColor: theme.surface,
			borderRadius: 16,
			padding: 18,
			gap: 14,
			borderWidth: 1,
			borderColor: theme.onSurface,
		},
		inputGroup: {
			gap: 10,
		},
		input: {
			backgroundColor: theme.background,
			borderRadius,
			paddingHorizontal: 16,
			paddingVertical: 14,
			color: theme.text,
			fontSize: 16,
			borderWidth: 1,
			borderColor: theme.onSurface,
		},
		primaryButton: {
			backgroundColor: theme.primary,
			paddingVertical: 16,
			borderRadius,
			alignItems: "center",
			minHeight: 52,
		},
		errorBox: {
			backgroundColor: theme.errorSurface,
			paddingHorizontal: 12,
			paddingVertical: 10,
			borderRadius,
			flexDirection: "row",
			alignItems: "center",
			gap: 8,
		},
		googleButton: {
			backgroundColor: theme.background,
			paddingVertical: 16,
			borderRadius,
			alignItems: "center",
			flexDirection: "row",
			justifyContent: "center",
			gap: 10,
			borderWidth: 1,
			borderColor: theme.onSurface,
			minHeight: 52,
		},
		dividerRow: {
			flexDirection: "row",
			alignItems: "center",
			gap: 12,
			marginVertical: 2,
		},
		dividerLine: {
			flex: 1,
			height: StyleSheet.hairlineWidth,
			backgroundColor: theme.onSurface,
		},
		linkButton: {
			paddingVertical: 10,
			alignItems: "center",
		},
		guestButton: {
			paddingVertical: 16,
			borderRadius,
			alignItems: "center",
			borderWidth: 1,
			borderColor: theme.onSurface,
			minHeight: 52,
		},
		footerText: {
			marginTop: -2,
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
			await updateOnboardingComplete(true)
			// fire-and-forget: restore remote entries then push any local ones
			pullAll()
				.then(() => pushPending())
				.catch(() => {})
			router.replace(returnToPath ?? "/diary")
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
			await updateOnboardingComplete(true)
			pullAll()
				.then(() => pushPending())
				.catch(() => {})
			router.replace(returnToPath ?? "/diary")
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
		router.replace("/diary")
	}

	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior={Platform.OS === "ios" ? "padding" : "height"}
		>
			<ScrollView
				contentContainerStyle={styles.inner}
				keyboardShouldPersistTaps="handled"
			>
				<View style={styles.headerBlock}>
					<View style={styles.titleRow}>
						<View style={styles.iconCircle}>
							<Ionicons
								name="person-circle-outline"
								size={30}
								color={theme.primary}
							/>
						</View>
						<View style={{ flex: 1 }}>
							<ThemedText type="title">Sign In</ThemedText>
							<ThemedText type="subtitleLight">
								{returnToPath
									? "Sign in to continue your premium purchase."
									: "Welcome back. Pick up where you left off."}
							</ThemedText>
						</View>
					</View>
					<ThemedText type="subtitleLight" style={styles.footerText}>
						{returnToPath
							? "Purchases are linked to your account so they can be restored on any device."
							: "Sign in to sync your diary, targets, and AI coaching history."}
					</ThemedText>
				</View>

				<View style={styles.formCard}>
					<View style={styles.inputGroup}>
						<TextInput
							style={styles.input}
							placeholder="Email"
							placeholderTextColor={theme.text + "80"}
							value={email}
							onChangeText={setEmail}
							keyboardType="email-address"
							autoCapitalize="none"
							testID="login-email"
						/>
						<TextInput
							style={styles.input}
							placeholder="Password"
							placeholderTextColor={theme.text + "80"}
							value={password}
							onChangeText={setPassword}
							secureTextEntry
							testID="login-password"
						/>
					</View>

					{error && (
						<View style={styles.errorBox}>
							<Ionicons
								name="alert-circle-outline"
								size={16}
								color={theme.error}
							/>
							<ThemedText
								type="subtitleLight"
								color={theme.error}
								style={{ flex: 1 }}
							>
								{error}
							</ThemedText>
						</View>
					)}

					<CustomPressable
						borderRadius={borderRadius}
						style={styles.primaryButton}
						onPress={handleSubmit}
						disabled={isLoading || isGoogleLoading}
						testID="login-submit"
					>
						<ThemedText
							type="defaultSemiBold"
							color={theme.background}
						>
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
						disabled={isLoading || isGoogleLoading}
						testID="login-google"
					>
						<Ionicons
							name="logo-google"
							size={20}
							color={theme.text}
						/>
						<ThemedText type="defaultSemiBold">
							{isGoogleLoading
								? "Signing in…"
								: "Continue with Google"}
						</ThemedText>
					</CustomPressable>

					{!returnToPath && (
						<CustomPressable
							borderRadius={borderRadius}
							style={styles.guestButton}
							onPress={handleContinueAsGuest}
							testID="login-guest"
						>
							<ThemedText type="default">
								Continue as Guest
							</ThemedText>
						</CustomPressable>
					)}
				</View>

				<CustomPressable
					borderRadius={borderRadius}
					style={styles.linkButton}
					onPress={() => {
						if (returnToPath) {
							router.replace({
								pathname: "/(onboarding)/register",
								params: { returnTo: returnToPath },
							})
							return
						}
						router.replace("/(onboarding)/register")
					}}
				>
					<ThemedText type="subtitleLight" color={theme.primary}>
						Don&apos;t have an account? Create one
					</ThemedText>
				</CustomPressable>
			</ScrollView>
		</KeyboardAvoidingView>
	)
}
