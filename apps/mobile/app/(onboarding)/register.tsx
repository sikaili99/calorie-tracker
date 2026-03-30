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
import { useDiarySync } from "@/hooks/useDiarySync"
import { borderRadius } from "@/constants/Theme"

export default function RegisterScreen() {
	const theme = useThemeColor()
	const { register } = useAuth()
	const { pushPending } = useDiarySync()
	const [firstName, setFirstName] = useState("")
	const [lastName, setLastName] = useState("")
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
		nameRow: {
			flexDirection: "row",
			gap: 12,
		},
		nameInput: {
			flex: 1,
			backgroundColor: theme.surface,
			borderRadius,
			paddingHorizontal: 16,
			paddingVertical: 14,
			color: theme.text,
			fontSize: 16,
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
		linkButton: {
			paddingVertical: 12,
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
			await register(firstName.trim(), lastName.trim(), email.trim(), password)
			// push any entries logged before registering
			pushPending().catch(() => {})
			router.push("/(onboarding)/goal-wizard")
		} catch (e: any) {
			setError(e?.response?.data?.message ?? "Registration failed. Please try again.")
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior={Platform.OS === "ios" ? "padding" : "height"}
		>
			<ScrollView contentContainerStyle={styles.inner}>
				<ThemedText type="title">Create Account</ThemedText>
				<ThemedText type="subtitleLight" style={{ marginBottom: 8 }}>
					Set up your account to sync your data.
				</ThemedText>

				<View style={styles.nameRow}>
					<TextInput
						style={styles.nameInput}
						placeholder="First name"
						placeholderTextColor={theme.text + "80"}
						value={firstName}
						onChangeText={setFirstName}
						autoCapitalize="words"
					/>
					<TextInput
						style={styles.nameInput}
						placeholder="Last name"
						placeholderTextColor={theme.text + "80"}
						value={lastName}
						onChangeText={setLastName}
						autoCapitalize="words"
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
						{isLoading ? "Creating…" : "Create Account"}
					</ThemedText>
				</CustomPressable>

				<CustomPressable
					borderRadius={borderRadius}
					style={styles.linkButton}
					onPress={() => router.replace("/(onboarding)/login")}
				>
					<ThemedText type="subtitleLight" color={theme.primary}>
						Already have an account? Sign In
					</ThemedText>
				</CustomPressable>
			</ScrollView>
		</KeyboardAvoidingView>
	)
}
