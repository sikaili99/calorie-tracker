import { Header } from "@/components/Header"
import { View, StyleSheet, Switch, ScrollView } from "react-native"
import { useSettings } from "@/providers/SettingsProvider"
import { useMemo, useCallback, useState, useEffect } from "react"
import { useThemeColor } from "@/hooks/useThemeColor"
import { SettingItem } from "@/components/SettingItem"
import { CustomTextInput } from "@/components/CustomTextInput"
import { ThemedText } from "@/components/ThemedText"
import { borderRadius, spacing } from "@/constants/Theme"
import { TargetSuggestionBanner } from "@/components/TargetSuggestionBanner"
import { LoadingState } from "@/components/LoadingState"

export default function Index() {
	const theme = useThemeColor()
	const {
		targetCalories,
		targetCarbsPercentage,
		targetFatPercentage,
		targetProteinPercentage,
		notificationsEnabled,
		reminderHour,
		reminderMinute,
		updateTargetCalories,
		updateTargetCarbsPercentage,
		updateTargetFatPercentage,
		updateTargetProteinPercentage,
		updateNotificationsEnabled,
	} = useSettings()

	const styles = useMemo(
		() =>
			StyleSheet.create({
				container: {
					flex: 1,
					backgroundColor: theme.background,
				},
				scroll: {
					flex: 1,
				},
				scrollContent: {
					padding: spacing.lg,
					gap: spacing.xl,
					paddingBottom: spacing.xxl,
				},
				sectionLabel: {
					marginBottom: spacing.sm,
					marginLeft: spacing.xs,
				},
				card: {
					borderRadius,
					overflow: "hidden",
				},
				macroBar: {
					flexDirection: "row",
					height: 6,
					borderRadius: 3,
					overflow: "hidden",
					marginHorizontal: spacing.lg,
					marginTop: -spacing.sm,
					marginBottom: spacing.md,
				},
				macroSegment: {
					height: "100%",
				},
				macroFooter: {
					flexDirection: "row",
					justifyContent: "space-between",
					alignItems: "center",
					paddingHorizontal: spacing.lg,
					paddingVertical: spacing.md,
					backgroundColor: theme.surface,
					borderTopWidth: StyleSheet.hairlineWidth,
					borderTopColor: theme.onSurface,
				},
				notificationRow: {
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "space-between",
					paddingHorizontal: spacing.lg,
					paddingVertical: 14,
					backgroundColor: theme.surface,
					borderRadius,
				},
				notificationLabel: {
					flex: 1,
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
			if (!value || !setter) return
			const numericValue = Number(value)
			if (numericValue) setter(numericValue)
		},
		[]
	)

	const [targetCaloriesInput, setTargetCaloriesInput] = useState<string>()
	const [targetProteinInput, setTargetProteinInput] = useState<string>()
	const [targetFatInput, setTargetFatInput] = useState<string>()
	const [targetCarbsInput, setTargetCarbsInput] = useState<string>()

	useEffect(() => {
		if (targetCalories) setTargetCaloriesInput(targetCalories.toString())
		if (targetProteinPercentage) setTargetProteinInput(targetProteinPercentage.toString())
		if (targetFatPercentage) setTargetFatInput(targetFatPercentage.toString())
		if (targetCarbsPercentage) setTargetCarbsInput(targetCarbsPercentage.toString())
	}, [targetCalories, targetProteinPercentage, targetFatPercentage, targetCarbsPercentage])

	const totalPercentage = useMemo(
		() =>
			(targetCarbsPercentage ?? 0) +
			(targetProteinPercentage ?? 0) +
			(targetFatPercentage ?? 0),
		[targetCarbsPercentage, targetProteinPercentage, targetFatPercentage]
	)

	const macroValid = totalPercentage === 100

	return (
		<View style={styles.container}>
			<Header title="Settings" />
			<TargetSuggestionBanner />
			{allSettingsLoaded ? (
				<ScrollView
					style={styles.scroll}
					contentContainerStyle={styles.scrollContent}
					showsVerticalScrollIndicator={false}
				>
					{/* Calories */}
					<View>
						<ThemedText type="subtitleBold" style={styles.sectionLabel}>
							DAILY TARGET
						</ThemedText>
						<View style={styles.card}>
							<SettingItem
								title="Calorie Target"
								value={`${targetCalories ?? 0} kcal`}
								iconName="flame-outline"
								isFirst
								isLast
								onSubmit={() =>
									handleNumericChange(targetCaloriesInput, updateTargetCalories)
								}
							>
								<CustomTextInput
									value={targetCaloriesInput}
									onChangeText={setTargetCaloriesInput}
								/>
							</SettingItem>
						</View>
					</View>

					{/* Macros */}
					<View>
						<ThemedText type="subtitleBold" style={styles.sectionLabel}>
							MACROS
						</ThemedText>
						<View style={styles.card}>
							<SettingItem
								title="Carbohydrates"
								value={`${targetCarbsPercentage ?? 0}%`}
								iconName="leaf-outline"
								isFirst
								onSubmit={() =>
									handleNumericChange(targetCarbsInput, updateTargetCarbsPercentage)
								}
							>
								<CustomTextInput
									value={targetCarbsInput}
									onChangeText={setTargetCarbsInput}
								/>
							</SettingItem>
							<SettingItem
								title="Protein"
								value={`${targetProteinPercentage ?? 0}%`}
								iconName="barbell-outline"
								onSubmit={() =>
									handleNumericChange(targetProteinInput, updateTargetProteinPercentage)
								}
							>
								<CustomTextInput
									value={targetProteinInput}
									onChangeText={setTargetProteinInput}
								/>
							</SettingItem>
							<SettingItem
								title="Fat"
								value={`${targetFatPercentage ?? 0}%`}
								iconName="water-outline"
								isLast
								onSubmit={() =>
									handleNumericChange(targetFatInput, updateTargetFatPercentage)
								}
							>
								<CustomTextInput
									value={targetFatInput}
									onChangeText={setTargetFatInput}
								/>
							</SettingItem>
						</View>

						{/* Macro bar */}
						<View style={styles.macroBar}>
							<View
								style={[
									styles.macroSegment,
									{ flex: targetCarbsPercentage ?? 0, backgroundColor: "#5BBEF9" },
								]}
							/>
							<View
								style={[
									styles.macroSegment,
									{ flex: targetProteinPercentage ?? 0, backgroundColor: "#22C55E" },
								]}
							/>
							<View
								style={[
									styles.macroSegment,
									{ flex: targetFatPercentage ?? 0, backgroundColor: "#F59E0B" },
								]}
							/>
							{totalPercentage < 100 && (
								<View
									style={[
										styles.macroSegment,
										{ flex: 100 - totalPercentage, backgroundColor: theme.onSurface },
									]}
								/>
							)}
						</View>

						<View style={styles.macroFooter}>
							<ThemedText type="subtitleLight">
								<ThemedText type="subtitleBold" color="#5BBEF9">C </ThemedText>
								<ThemedText type="subtitleLight" color="#5BBEF9">{targetCarbsPercentage ?? 0}%</ThemedText>
								{"   "}
								<ThemedText type="subtitleBold" color="#22C55E">P </ThemedText>
								<ThemedText type="subtitleLight" color="#22C55E">{targetProteinPercentage ?? 0}%</ThemedText>
								{"   "}
								<ThemedText type="subtitleBold" color="#F59E0B">F </ThemedText>
								<ThemedText type="subtitleLight" color="#F59E0B">{targetFatPercentage ?? 0}%</ThemedText>
							</ThemedText>
							<ThemedText
								type="subtitleBold"
								color={macroValid ? theme.success : theme.error}
							>
								{macroValid ? "✓ 100%" : `${totalPercentage}% / 100%`}
							</ThemedText>
						</View>
					</View>

					{/* Reminders */}
					<View>
						<ThemedText type="subtitleBold" style={styles.sectionLabel}>
							REMINDERS
						</ThemedText>
						<View style={styles.notificationRow}>
							<View style={styles.notificationLabel}>
								<ThemedText type="defaultSemiBold">
									Daily Reminder
								</ThemedText>
								<ThemedText type="subtitleLight">
									Remind me to log my meals at {reminderTimeLabel}
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
					</View>
				</ScrollView>
			) : (
				<LoadingState message="Loading settings…" />
			)}
		</View>
	)
}
