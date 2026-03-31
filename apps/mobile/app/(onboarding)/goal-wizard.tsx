import React, { useState } from "react"
import {
	View,
	StyleSheet,
	TextInput,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	TouchableOpacity,
} from "react-native"
import { router } from "expo-router"
import { useThemeColor } from "@/hooks/useThemeColor"
import { ThemedText } from "@/components/ThemedText"
import { CustomPressable } from "@/components/CustomPressable"
import { useSettings } from "@/providers/SettingsProvider"
import {
	calculateTDEE,
	ActivityLevel,
	GoalType,
} from "@/utils/tdee"
import { borderRadius } from "@/constants/Theme"

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; description: string }[] = [
	{ value: "sedentary", label: "Sedentary", description: "Little or no exercise" },
	{ value: "light", label: "Lightly Active", description: "1–3 days/week" },
	{ value: "moderate", label: "Moderately Active", description: "3–5 days/week" },
	{ value: "active", label: "Very Active", description: "6–7 days/week" },
	{ value: "very_active", label: "Extremely Active", description: "Hard training daily" },
]

const GOAL_OPTIONS: { value: GoalType; label: string; description: string }[] = [
	{ value: "lose", label: "Lose Weight", description: "−500 kcal/day deficit" },
	{ value: "maintain", label: "Maintain Weight", description: "Stay at current weight" },
	{ value: "gain", label: "Gain Muscle", description: "+300 kcal/day surplus" },
]

export default function GoalWizardScreen() {
	const theme = useThemeColor()
	const {
		updateOnboardingComplete,
		updateTargetCalories,
		updateTargetCarbsPercentage,
		updateTargetProteinPercentage,
		updateTargetFatPercentage,
		updateUserProfile,
	} = useSettings()

	const [step, setStep] = useState(1)
	const [userName, setUserName] = useState("")
	const [userAge, setUserAge] = useState("")
	const [userWeightKg, setUserWeightKg] = useState("")
	const [userHeightCm, setUserHeightCm] = useState("")
	const [activityLevel, setActivityLevel] = useState<ActivityLevel>("moderate")
	const [goalType, setGoalType] = useState<GoalType>("maintain")

	const styles = StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: theme.background,
		},
		inner: {
			flexGrow: 1,
			padding: 24,
			gap: 12,
		},
		header: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			marginBottom: 8,
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
			paddingVertical: 14,
			borderRadius,
			alignItems: "center",
		},
		optionButton: {
			backgroundColor: theme.surface,
			borderRadius,
			padding: 16,
			gap: 2,
		},
		optionButtonSelected: {
			backgroundColor: theme.primaryAlpha20,
			borderLeftWidth: 3,
			borderLeftColor: theme.primary,
		},
		buttonRow: {
			flexDirection: "row",
			gap: 12,
			marginTop: 8,
		},
		flex: { flex: 1 },
		progressContainer: {
			flexDirection: "row",
			gap: 6,
			marginBottom: 4,
		},
		progressSegment: {
			height: 4,
			borderRadius: 2,
			flex: 1,
			backgroundColor: theme.onSurface,
		},
		progressSegmentActive: {
			backgroundColor: theme.primary,
		},
	})

	const handleSkip = async () => {
		await updateOnboardingComplete(true)
		router.replace("/(tabs)")
	}

	const handleBack = () => {
		if (step === 1) {
			router.back()
		} else {
			setStep((s) => s - 1)
		}
	}

	const handleNext = () => setStep((s) => s + 1)

	const handleFinish = async () => {
		const age = parseInt(userAge) || 25
		const weight = parseFloat(userWeightKg) || 70
		const height = parseFloat(userHeightCm) || 170

		const tdee = calculateTDEE(age, weight, height, activityLevel, goalType)

		await updateUserProfile({
			userName: userName.trim() || undefined,
			userAge: age,
			userWeightKg: weight,
			userHeightCm: height,
			activityLevel,
			goalType,
		})
		await Promise.all([
			updateTargetCalories(tdee.calories),
			updateTargetCarbsPercentage(tdee.carbsPct),
			updateTargetProteinPercentage(tdee.proteinPct),
			updateTargetFatPercentage(tdee.fatPct),
			updateOnboardingComplete(true),
		])
		router.replace("/(tabs)")
	}

	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior={Platform.OS === "ios" ? "padding" : "height"}
		>
			<ScrollView contentContainerStyle={styles.inner}>
				<View style={styles.progressContainer}>
					{[1, 2, 3, 4].map((s) => (
						<View
							key={s}
							style={[
								styles.progressSegment,
								s <= step && styles.progressSegmentActive,
							]}
						/>
					))}
				</View>
				<View style={styles.header}>
					<ThemedText type="subtitleLight">Step {step} of 4</ThemedText>
					<TouchableOpacity onPress={handleSkip} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} testID="goal-wizard-skip">
						<ThemedText type="subtitleLight" color={theme.primary}>
							Skip
						</ThemedText>
					</TouchableOpacity>
				</View>

				{step === 1 && (
					<>
						<ThemedText type="title">About You</ThemedText>
						<ThemedText type="subtitleLight" style={{ marginBottom: 8 }}>
							Help us personalise your goals.
						</ThemedText>
						<TextInput
							style={styles.input}
							placeholder="Name (optional)"
							placeholderTextColor={theme.text + "80"}
							value={userName}
							onChangeText={setUserName}
							autoCapitalize="words"
						/>
						<TextInput
							style={styles.input}
							placeholder="Age"
							placeholderTextColor={theme.text + "80"}
							value={userAge}
							onChangeText={setUserAge}
							keyboardType="numeric"
						/>
					</>
				)}

				{step === 2 && (
					<>
						<ThemedText type="title">Body Measurements</ThemedText>
						<ThemedText type="subtitleLight" style={{ marginBottom: 8 }}>
							Used to calculate your daily calorie target.
						</ThemedText>
						<TextInput
							style={styles.input}
							placeholder="Weight (kg)"
							placeholderTextColor={theme.text + "80"}
							value={userWeightKg}
							onChangeText={setUserWeightKg}
							keyboardType="decimal-pad"
						/>
						<TextInput
							style={styles.input}
							placeholder="Height (cm)"
							placeholderTextColor={theme.text + "80"}
							value={userHeightCm}
							onChangeText={setUserHeightCm}
							keyboardType="decimal-pad"
						/>
					</>
				)}

				{step === 3 && (
					<>
						<ThemedText type="title">Activity Level</ThemedText>
						<ThemedText type="subtitleLight" style={{ marginBottom: 8 }}>
							How active are you on a typical week?
						</ThemedText>
						{ACTIVITY_OPTIONS.map((opt) => (
							<CustomPressable
								key={opt.value}
								borderRadius={borderRadius}
								style={activityLevel === opt.value ? { ...styles.optionButton, ...styles.optionButtonSelected } : styles.optionButton}
								onPress={() => setActivityLevel(opt.value)}
							>
								<ThemedText type="defaultSemiBold">{opt.label}</ThemedText>
								<ThemedText type="subtitleLight">{opt.description}</ThemedText>
							</CustomPressable>
						))}
					</>
				)}

				{step === 4 && (
					<>
						<ThemedText type="title">Your Goal</ThemedText>
						<ThemedText type="subtitleLight" style={{ marginBottom: 8 }}>
							What are you working towards?
						</ThemedText>
						{GOAL_OPTIONS.map((opt) => (
							<CustomPressable
								key={opt.value}
								borderRadius={borderRadius}
								style={goalType === opt.value ? { ...styles.optionButton, ...styles.optionButtonSelected } : styles.optionButton}
								onPress={() => setGoalType(opt.value)}
							>
								<ThemedText type="defaultSemiBold">{opt.label}</ThemedText>
								<ThemedText type="subtitleLight">{opt.description}</ThemedText>
							</CustomPressable>
						))}
					</>
				)}

				<View style={styles.buttonRow}>
					<CustomPressable
						borderRadius={borderRadius}
						style={{ ...styles.secondaryButton, ...styles.flex }}
						onPress={handleBack}
					>
						<ThemedText type="defaultSemiBold">Back</ThemedText>
					</CustomPressable>
					<CustomPressable
						borderRadius={borderRadius}
						style={{ ...styles.primaryButton, ...styles.flex, marginTop: 0 }}
						onPress={step < 4 ? handleNext : handleFinish}
						testID="goal-wizard-next"
					>
						<ThemedText type="defaultSemiBold" color={theme.background}>
							{step < 4 ? "Next" : "Finish"}
						</ThemedText>
					</CustomPressable>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	)
}
