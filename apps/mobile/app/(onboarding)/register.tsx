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

export default function RegisterScreen() {
	const theme = useThemeColor()
	const { register, loginWithGoogle } = useAuth()
	const { updateOnboardingComplete } = useSettings()
	const { pushPending } = useDiarySync()
	const { returnTo } = useLocalSearchParams<{ returnTo?: string }>()
	const returnToPath =
		typeof returnTo === "string" && returnTo.trim().length > 0
			? returnTo
			: undefined
	const [firstName, setFirstName] = useState("")
	const [lastName, setLastName] = useState("")
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
		nameRow: {
			flexDirection: "row",
			gap: 12,
		},
		nameInput: {
			flex: 1,
			backgroundColor: theme.background,
			borderRadius,
			paddingHorizontal: 16,
			paddingVertical: 14,
			color: theme.text,
			fontSize: 16,
			borderWidth: 1,
			borderColor: theme.onSurface,
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
		errorBox: {
			backgroundColor: theme.errorSurface,
			paddingHorizontal: 12,
			paddingVertical: 10,
			borderRadius,
			flexDirection: "row",
			alignItems: "center",
			gap: 8,
		},
		linkButton: {
			paddingVertical: 10,
			alignItems: "center",
		},
	})

	const handleSubmit = async () => {
		if (
			!firstName.trim() ||
			!lastName.trim() ||
			!email.trim() ||
			!password.trim()
		) {
			setError("Please fill in all fields.")
			return
		}
		setIsLoading(true)
		setError(null)
		try {
			await register(
				firstName.trim(),
				lastName.trim(),
				email.trim(),
				password
			)
			// push any entries logged before registering
			pushPending().catch(() => {})
			if (returnToPath) {
				await updateOnboardingComplete(true)
				router.replace(returnToPath)
				return
			}
			router.push("/(onboarding)/goal-wizard")
		} catch (e: any) {
			setError(
				e?.response?.data?.message ??
					"Registration failed. Please try again."
			)
		} finally {
			setIsLoading(false)
		}
	}

	const handleGoogleRegister = async () => {
		setIsGoogleLoading(true)
		setError(null)
		try {
			await loginWithGoogle()
			pushPending().catch(() => {})
			if (returnToPath) {
				await updateOnboardingComplete(true)
				router.replace(returnToPath)
				return
			}
			router.push("/(onboarding)/goal-wizard")
		} catch (e: any) {
			if (e?.message !== "Dismissed") {
				setError("Google sign-in failed. Please try again.")
			}
		} finally {
			setIsGoogleLoading(false)
		}
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
								name="person-add-outline"
								size={30}
								color={theme.primary}
							/>
						</View>
						<View style={{ flex: 1 }}>
							<ThemedText type="title">Create Account</ThemedText>
							<ThemedText type="subtitleLight">
								{returnToPath
									? "Create an account to continue premium checkout."
									: "Save your progress and sync your nutrition data."}
							</ThemedText>
						</View>
					</View>
					<ThemedText type="subtitleLight">
						{returnToPath
							? "Premium purchases are tied to your account for restore across devices."
							: "You can still continue as guest later if needed."}
					</ThemedText>
				</View>

				<View style={styles.formCard}>
					<View style={styles.nameRow}>
						<TextInput
							style={styles.nameInput}
							placeholder="First name"
							placeholderTextColor={theme.text + "80"}
							value={firstName}
							onChangeText={setFirstName}
							autoCapitalize="words"
							testID="register-first-name"
						/>
						<TextInput
							style={styles.nameInput}
							placeholder="Last name"
							placeholderTextColor={theme.text + "80"}
							value={lastName}
							onChangeText={setLastName}
							autoCapitalize="words"
							testID="register-last-name"
						/>
					</View>

					<TextInput
						style={styles.input}
						placeholder="Email"
						placeholderTextColor={theme.text + "80"}
						value={email}
						onChangeText={setEmail}
						keyboardType="email-address"
						autoCapitalize="none"
						testID="register-email"
					/>
					<TextInput
						style={styles.input}
						placeholder="Password"
						placeholderTextColor={theme.text + "80"}
						value={password}
						onChangeText={setPassword}
						secureTextEntry
						testID="register-password"
					/>

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
						testID="register-submit"
					>
						<ThemedText
							type="defaultSemiBold"
							color={theme.background}
						>
							{isLoading ? "Creating…" : "Create Account"}
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
						onPress={handleGoogleRegister}
						disabled={isLoading || isGoogleLoading}
						testID="register-google"
					>
						<Ionicons
							name="logo-google"
							size={20}
							color={theme.text}
						/>
						<ThemedText type="defaultSemiBold">
							{isGoogleLoading
								? "Starting…"
								: "Continue with Google"}
						</ThemedText>
					</CustomPressable>
				</View>

				<CustomPressable
					borderRadius={borderRadius}
					style={styles.linkButton}
					onPress={() => {
						if (returnToPath) {
							router.replace({
								pathname: "/(onboarding)/login",
								params: { returnTo: returnToPath },
							})
							return
						}
						router.replace("/(onboarding)/login")
					}}
				>
					<ThemedText type="subtitleLight" color={theme.primary}>
						Already have an account? Sign In
					</ThemedText>
				</CustomPressable>
			</ScrollView>
		</KeyboardAvoidingView>
	)
}
