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
import { borderRadius } from "@/constants/Theme"

export default function RegisterScreen() {
	const theme = useThemeColor()
	const [name, setName] = useState("")
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
		linkButton: {
			paddingVertical: 12,
			alignItems: "center",
		},
	})

	const handleSubmit = async () => {
		if (!name.trim() || !email.trim() || !password.trim()) {
			setError("Please fill in all fields.")
			return
		}
		setIsLoading(true)
		setError(null)
		try {
			await BackendAPI.register(name.trim(), email.trim(), password)
			router.push("/(onboarding)/goal-wizard")
		} catch {
			setError("Coming soon! Continue as a guest for now.")
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

				<TextInput
					style={styles.input}
					placeholder="Name"
					placeholderTextColor={theme.text + "80"}
					value={name}
					onChangeText={setName}
					autoCapitalize="words"
				/>
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
