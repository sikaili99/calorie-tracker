import { Header } from "@/components/Header"
import {
	View,
	StyleSheet,
	Switch,
	ScrollView,
	Modal,
	TouchableOpacity,
	FlatList,
} from "react-native"
import { useSettings } from "@/providers/SettingsProvider"
import { useMemo, useCallback, useState, useEffect, useRef } from "react"
import { useThemeColor } from "@/hooks/useThemeColor"
import { SettingItem } from "@/components/SettingItem"
import { CustomTextInput } from "@/components/CustomTextInput"
import { ThemedText } from "@/components/ThemedText"
import { borderRadius, spacing } from "@/constants/Theme"
import { TargetSuggestionBanner } from "@/components/TargetSuggestionBanner"
import { LoadingState } from "@/components/LoadingState"
import Ionicons from "@expo/vector-icons/Ionicons"

const ITEM_HEIGHT = 48
const HOURS = Array.from({ length: 24 }, (_, i) => i)
const MINUTES = Array.from({ length: 60 }, (_, i) => i)

function TimePickerModal({
	visible,
	initialHour,
	initialMinute,
	onConfirm,
	onDismiss,
}: {
	visible: boolean
	initialHour: number
	initialMinute: number
	onConfirm: (hour: number, minute: number) => void
	onDismiss: () => void
}) {
	const theme = useThemeColor()
	const [hour, setHour] = useState(initialHour)
	const [minute, setMinute] = useState(initialMinute)
	const hourRef = useRef<FlatList>(null)
	const minuteRef = useRef<FlatList>(null)

	useEffect(() => {
		if (visible) {
			setHour(initialHour)
			setMinute(initialMinute)
			setTimeout(() => {
				hourRef.current?.scrollToIndex({ index: initialHour, animated: false })
				minuteRef.current?.scrollToIndex({ index: initialMinute, animated: false })
			}, 50)
		}
	}, [visible, initialHour, initialMinute])

	const styles = useMemo(
		() =>
			StyleSheet.create({
				overlay: {
					flex: 1,
					backgroundColor: "rgba(0,0,0,0.5)",
					justifyContent: "flex-end",
				},
				sheet: {
					backgroundColor: theme.surface,
					borderTopLeftRadius: 20,
					borderTopRightRadius: 20,
					paddingBottom: 32,
				},
				handle: {
					width: 36,
					height: 4,
					borderRadius: 2,
					backgroundColor: theme.onSurface,
					alignSelf: "center",
					marginTop: 12,
					marginBottom: 8,
				},
				header: {
					flexDirection: "row",
					justifyContent: "space-between",
					alignItems: "center",
					paddingHorizontal: spacing.lg,
					paddingVertical: spacing.md,
				},
				pickerRow: {
					flexDirection: "row",
					justifyContent: "center",
					alignItems: "center",
					height: ITEM_HEIGHT * 5,
					gap: 8,
				},
				column: {
					width: 80,
					height: ITEM_HEIGHT * 5,
				},
				selectionHighlight: {
					position: "absolute",
					top: ITEM_HEIGHT * 2,
					left: 0,
					right: 0,
					height: ITEM_HEIGHT,
					backgroundColor: theme.primaryAlpha20,
					borderRadius: 8,
					pointerEvents: "none",
				},
				item: {
					height: ITEM_HEIGHT,
					justifyContent: "center",
					alignItems: "center",
				},
				separator: {
					alignSelf: "center",
					paddingTop: ITEM_HEIGHT * 2,
				},
			}),
		[theme]
	)

	const renderHour = useCallback(
		({ item }: { item: number }) => {
			const selected = item === hour
			const period = item >= 12 ? "PM" : "AM"
			const display = item % 12 === 0 ? 12 : item % 12
			return (
				<TouchableOpacity style={styles.item} onPress={() => setHour(item)}>
					<ThemedText
						type={selected ? "defaultSemiBold" : "default"}
						color={selected ? theme.primary : theme.text}
					>
						{`${display} ${period}`}
					</ThemedText>
				</TouchableOpacity>
			)
		},
		[hour, theme, styles]
	)

	const renderMinute = useCallback(
		({ item }: { item: number }) => {
			const selected = item === minute
			return (
				<TouchableOpacity style={styles.item} onPress={() => setMinute(item)}>
					<ThemedText
						type={selected ? "defaultSemiBold" : "default"}
						color={selected ? theme.primary : theme.text}
					>
						{item.toString().padStart(2, "0")}
					</ThemedText>
				</TouchableOpacity>
			)
		},
		[minute, theme, styles]
	)

	const onScrollHourEnd = useCallback(
		(e: any) => {
			const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT)
			setHour(Math.min(23, Math.max(0, index)))
		},
		[]
	)

	const onScrollMinuteEnd = useCallback(
		(e: any) => {
			const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT)
			setMinute(Math.min(59, Math.max(0, index)))
		},
		[]
	)

	return (
		<Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
			<TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onDismiss}>
				<TouchableOpacity activeOpacity={1} onPress={() => {}}>
					<View style={styles.sheet}>
						<View style={styles.handle} />
						<View style={styles.header}>
							<TouchableOpacity onPress={onDismiss} hitSlop={10}>
								<ThemedText color={theme.primary}>Cancel</ThemedText>
							</TouchableOpacity>
							<ThemedText type="defaultSemiBold">Reminder Time</ThemedText>
							<TouchableOpacity onPress={() => onConfirm(hour, minute)} hitSlop={10}>
								<ThemedText type="defaultSemiBold" color={theme.primary}>
									Done
								</ThemedText>
							</TouchableOpacity>
						</View>

						<View style={styles.pickerRow}>
							{/* Hour column */}
							<View style={styles.column}>
								<View style={styles.selectionHighlight} />
								<FlatList
									ref={hourRef}
									data={HOURS}
									keyExtractor={(i) => `h${i}`}
									renderItem={renderHour}
									showsVerticalScrollIndicator={false}
									snapToInterval={ITEM_HEIGHT}
									decelerationRate="fast"
									onMomentumScrollEnd={onScrollHourEnd}
									contentContainerStyle={{
										paddingVertical: ITEM_HEIGHT * 2,
									}}
									getItemLayout={(_, index) => ({
										length: ITEM_HEIGHT,
										offset: ITEM_HEIGHT * index,
										index,
									})}
								/>
							</View>

							<View style={styles.separator}>
								<ThemedText type="defaultSemiBold">:</ThemedText>
							</View>

							{/* Minute column */}
							<View style={styles.column}>
								<View style={styles.selectionHighlight} />
								<FlatList
									ref={minuteRef}
									data={MINUTES}
									keyExtractor={(i) => `m${i}`}
									renderItem={renderMinute}
									showsVerticalScrollIndicator={false}
									snapToInterval={ITEM_HEIGHT}
									decelerationRate="fast"
									onMomentumScrollEnd={onScrollMinuteEnd}
									contentContainerStyle={{
										paddingVertical: ITEM_HEIGHT * 2,
									}}
									getItemLayout={(_, index) => ({
										length: ITEM_HEIGHT,
										offset: ITEM_HEIGHT * index,
										index,
									})}
								/>
							</View>
						</View>
					</View>
				</TouchableOpacity>
			</TouchableOpacity>
		</Modal>
	)
}

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
		updateReminderTime,
	} = useSettings()

	const [timePickerVisible, setTimePickerVisible] = useState(false)

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
				reminderCard: {
					backgroundColor: theme.surface,
					borderRadius,
				},
				reminderToggleRow: {
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "space-between",
					paddingHorizontal: spacing.lg,
					paddingVertical: 14,
				},
				reminderTimeRow: {
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "space-between",
					paddingHorizontal: spacing.lg,
					paddingVertical: 14,
					borderTopWidth: StyleSheet.hairlineWidth,
					borderTopColor: theme.onSurface,
				},
				reminderTimeLeft: {
					flexDirection: "row",
					alignItems: "center",
					gap: spacing.sm,
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
		[targetCalories, targetCarbsPercentage, targetProteinPercentage, targetFatPercentage]
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

	const handleTimeConfirm = useCallback(
		(hour: number, minute: number) => {
			updateReminderTime(hour, minute)
			setTimePickerVisible(false)
		},
		[updateReminderTime]
	)

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
						<View style={styles.reminderCard}>
							<View style={styles.reminderToggleRow}>
								<View style={styles.notificationLabel}>
									<ThemedText type="defaultSemiBold">Daily Reminder</ThemedText>
									<ThemedText type="subtitleLight">
										Log your meals every day
									</ThemedText>
								</View>
								<Switch
									value={notificationsEnabled}
									onValueChange={updateNotificationsEnabled}
									trackColor={{ false: theme.onSurface, true: theme.primary }}
									thumbColor={theme.surface}
								/>
							</View>

							{notificationsEnabled && (
								<TouchableOpacity
									style={styles.reminderTimeRow}
									onPress={() => setTimePickerVisible(true)}
									activeOpacity={0.7}
								>
									<View style={styles.reminderTimeLeft}>
										<Ionicons name="time-outline" size={18} color={theme.primary} />
										<ThemedText type="default">Reminder Time</ThemedText>
									</View>
									<View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
										<ThemedText type="subtitleBold" color={theme.primary}>
											{reminderTimeLabel}
										</ThemedText>
										<Ionicons name="chevron-forward" size={16} color={theme.text} style={{ opacity: 0.3 }} />
									</View>
								</TouchableOpacity>
							)}
						</View>
					</View>
				</ScrollView>
			) : (
				<LoadingState message="Loading settings…" />
			)}

			<TimePickerModal
				visible={timePickerVisible}
				initialHour={reminderHour ?? 20}
				initialMinute={reminderMinute ?? 0}
				onConfirm={handleTimeConfirm}
				onDismiss={() => setTimePickerVisible(false)}
			/>
		</View>
	)
}
