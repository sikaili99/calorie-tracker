import { Header } from "@/components/Header"
import { View, StyleSheet, Switch } from "react-native"
import { useSettings } from "@/providers/SettingsProvider"
import { useMemo, useCallback, useState, useEffect } from "react"
import { useThemeColor } from "@/hooks/useThemeColor"
import { SettingItem } from "@/components/SettingItem"
import { CustomTextInput } from "@/components/CustomTextInput"
import { ThemedText } from "@/components/ThemedText"
import { USDA_API_KEY_DEFAULT } from "@/api/UsdaApi"
import { borderRadius } from "@/constants/Theme"
import { TargetSuggestionBanner } from "@/components/TargetSuggestionBanner"

export default function Index() {
	const theme = useThemeColor()
	const {
		targetCalories,
		targetCarbsPercentage,
		targetFatPercentage,
		targetProteinPercentage,
		usdaApiKey,
		notificationsEnabled,
		reminderHour,
		reminderMinute,
		updateTargetCalories,
		updateTargetCarbsPercentage,
		updateTargetFatPercentage,
		updateTargetProteinPercentage,
		updateUsdaApiKey,
		updateNotificationsEnabled,
		updateReminderTime,
	} = useSettings()

	const styles = useMemo(
		() =>
			StyleSheet.create({
				mainContainer: {
					flex: 1,
				},
				contentContainer: {
					flex: 1,
				},
				notificationRow: {
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "space-between",
					paddingHorizontal: 16,
					paddingVertical: 14,
					backgroundColor: theme.surface,
					marginHorizontal: 16,
					marginTop: 8,
					borderRadius,
				},
				notificationLabel: {
					flex: 1,
				},
				sectionHeader: {
					marginHorizontal: 16,
					marginTop: 20,
					marginBottom: 4,
				},
			}),
		[theme]
	)

	const reminderTimeLabel = useMemo(() => {
		const h = reminderHour ?? 20
		const m = reminderMinute ?? 0
		const period = h >= 12 ? "PM" : "AM"
		const displayH = h % 12 === 0 ? 12 : h % 12
		const displayM = m.toString().padStart(2, "0")
		return `${displayH}:${displayM} ${period}`
	}, [reminderHour, reminderMinute])

	const allSettingsLoaded = useMemo(
		() =>
			targetCalories !== undefined &&
			targetCarbsPercentage !== undefined &&
			targetProteinPercentage !== undefined &&
			targetFatPercentage !== undefined,
		[
			targetCalories,
			targetCarbsPercentage,
			targetProteinPercentage,
			targetFatPercentage,
		]
	)

	const handleNumericChange = useCallback(
		(value?: string, setter?: (value: number) => void) => {
			if (!value || !setter) {
				return
			}
			const numericValue = Number(value)
			if (numericValue) {
				setter(numericValue)
			}
		},
		[]
	)

	const handleTextChange = useCallback(
		(value?: string, setter?: (value?: string) => void) => {
			if (!setter) {
				return
			}
			setter(value)
		},
		[]
	)

	const [targetCaloriesInput, setTargetCaloriesInput] = useState<string>()
	const [targetProteinInput, setTargetProteinInput] = useState<string>()
	const [targetFatInput, setTargetFatInput] = useState<string>()
	const [targetCarbsInput, setTargetCarbsInput] = useState<string>()
	const [usdaApiKeyInput, setUsdaApiKeyInput] = useState<string>()

	useEffect(() => {
		if (targetCalories) {
			setTargetCaloriesInput(targetCalories.toString())
		}
		if (targetProteinPercentage) {
			setTargetProteinInput(targetProteinPercentage.toString())
		}
		if (targetFatPercentage) {
			setTargetFatInput(targetFatPercentage.toString())
		}
		if (targetCarbsPercentage) {
			setTargetCarbsInput(targetCarbsPercentage.toString())
		}
	}, [
		targetCalories,
		targetProteinPercentage,
		targetFatPercentage,
		targetCarbsPercentage,
	])

	const totalPercentage = useMemo(
		() =>
			(targetCarbsPercentage ?? 0) +
			(targetProteinPercentage ?? 0) +
			(targetFatPercentage ?? 0),
		[targetCarbsPercentage, targetProteinPercentage, targetFatPercentage]
	)

	return (
		<View style={styles.mainContainer}>
			<Header title="Settings" />
			<TargetSuggestionBanner />
			<View style={styles.contentContainer}>
				{allSettingsLoaded ? (
					<>
						<SettingItem
							title="Target Calories"
							value={
								(targetCalories
									? targetCalories.toString()
									: "") + " Cal"
							}
							onSubmit={() =>
								handleNumericChange(
									targetCaloriesInput,
									updateTargetCalories
								)
							}
						>
							<CustomTextInput
								value={targetCaloriesInput}
								onChangeText={(text) =>
									setTargetCaloriesInput(text)
								}
							/>
						</SettingItem>
						<SettingItem
							title="Target Carbs"
							value={
								(targetCarbsPercentage
									? targetCarbsPercentage.toString()
									: "") + " %"
							}
							onSubmit={() =>
								handleNumericChange(
									targetCarbsInput,
									updateTargetCarbsPercentage
								)
							}
						>
							<CustomTextInput
								value={targetCarbsInput}
								onChangeText={(text) =>
									setTargetCarbsInput(text)
								}
							/>
						</SettingItem>
						<SettingItem
							title="Target Protein"
							value={
								(targetProteinPercentage
									? targetProteinPercentage.toString()
									: "") + " %"
							}
							onSubmit={() =>
								handleNumericChange(
									targetProteinInput,
									updateTargetProteinPercentage
								)
							}
						>
							<CustomTextInput
								value={targetProteinInput}
								onChangeText={(text) =>
									setTargetProteinInput(text)
								}
							/>
						</SettingItem>
						<SettingItem
							title="Target Fat"
							value={
								(targetFatPercentage
									? targetFatPercentage.toString()
									: "") + " %"
							}
							onSubmit={() =>
								handleNumericChange(
									targetFatInput,
									updateTargetFatPercentage
								)
							}
						>
							<CustomTextInput
								value={targetFatInput}
								onChangeText={(text) => setTargetFatInput(text)}
							/>
						</SettingItem>
						<ThemedText
							style={{ margin: 16 }}
							color={totalPercentage === 100 ? theme.text : "red"}
							type="subtitleBold"
						>
							Total percentage adds up to {totalPercentage}%
						</ThemedText>
						<SettingItem
							title="USDA api key"
							value={
								usdaApiKey?.length
									? usdaApiKey
									: USDA_API_KEY_DEFAULT
							}
							onSubmit={() =>
								handleTextChange(
									usdaApiKeyInput,
									updateUsdaApiKey
								)
							}
						>
							<CustomTextInput
								value={usdaApiKeyInput}
								onChangeText={(text) =>
									setUsdaApiKeyInput(text)
								}
							/>
						</SettingItem>
						<ThemedText
							type="subtitleBold"
							style={styles.sectionHeader}
						>
							Reminders
						</ThemedText>
						<View style={styles.notificationRow}>
							<View style={styles.notificationLabel}>
								<ThemedText type="defaultSemiBold">
									Daily Reminder
								</ThemedText>
								<ThemedText type="subtitleLight">
									Remind me to log my meals at{" "}
									{reminderTimeLabel}
								</ThemedText>
							</View>
							<Switch
								value={notificationsEnabled}
								onValueChange={updateNotificationsEnabled}
								trackColor={{
									false: theme.onSurface,
									true: theme.primary,
								}}
								thumbColor={theme.surface}
							/>
						</View>
					</>
				) : null}
			</View>
		</View>
	)
}
