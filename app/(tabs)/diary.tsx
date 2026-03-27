import { MealsSummary } from "@/components/diaryPage/MealsSummary"
import { NutritionSummary } from "@/components/diaryPage/NutritionSummary"
import { InsightsCard } from "@/components/diaryPage/InsightsCard"
import { StreakBadge } from "@/components/diaryPage/StreakBadge"
import { Header } from "@/components/Header"
import { paddingTopForHeader } from "@/constants/Theme"
import { useNutritionData } from "@/hooks/useNutritionData"
import useNavigationBarColor from "@/hooks/useNavigationBarColor"
import { useThemeColor } from "@/hooks/useThemeColor"
import { useSelectedDate } from "@/hooks/useSelectedDate"
import { useStreak } from "@/hooks/useStreak"
import { useInsights } from "@/hooks/useInsights"
import { useHistoricalData } from "@/hooks/useHistoricalData"
import React, { useMemo } from "react"
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { useSummary } from "@/hooks/useSummary"
import { useSettings } from "@/providers/SettingsProvider"
import Ionicons from "@expo/vector-icons/Ionicons"
import { formatDate } from "@/utils/Strings"
import { predictDayTotal } from "@/utils/prediction"

export default function DiaryScreen() {
	const theme = useThemeColor()

	useNavigationBarColor(theme.bottomNav)

	const styles = useMemo(
		() =>
			StyleSheet.create({
				mainContainer: {
					flex: 1,
					backgroundColor: theme.background,
				},
				scrollContainer: {
					alignItems: "center",
					justifyContent: "flex-start",
					paddingHorizontal: 16,
					paddingTop: paddingTopForHeader,
					paddingBottom: 32,
				},
				headerRow: {
					width: "100%",
				},
				nutritionSummary: {
					marginTop: 32,
					width: "100%",
				},
				mealsSection: {
					width: "100%",
					marginTop: 32,
				},
				dateNavContainer: {
					flexDirection: "row",
					alignItems: "center",
					gap: 4,
				},
				navButton: {
					padding: 4,
				},
			}),
		[theme, paddingTopForHeader]
	)

	const {
		targetCalories,
		targetCarbsPercentage,
		targetProteinPercentage,
		targetFatPercentage,
	} = useSettings()

	const { selectedDate, isToday, goToNextDay, goToPrevDay } =
		useSelectedDate()

	const { currentStreak } = useStreak()
	const { insights } = useInsights()
	const { mealBreakdown } = useHistoricalData(30)

	const totalCarbs = useMemo(
		() =>
			targetCalories && targetCarbsPercentage
				? (targetCalories * targetCarbsPercentage) / 100 / 4
				: 0,
		[targetCalories, targetCarbsPercentage]
	)
	const totalProtein = useMemo(
		() =>
			targetCalories && targetProteinPercentage
				? (targetCalories * targetProteinPercentage) / 100 / 4
				: 0,
		[targetCalories, targetProteinPercentage]
	)
	const totalFat = useMemo(
		() =>
			targetCalories && targetFatPercentage
				? (targetCalories * targetFatPercentage) / 100 / 9
				: 0,
		[targetCalories, targetFatPercentage]
	)

	// TODO replace this with data from settings
	// and move all this to a hook
	const totalCaloriesBreakfast = useMemo(
		() => (targetCalories ? targetCalories * 0.3 : 0),
		[targetCalories, targetCarbsPercentage, targetProteinPercentage]
	)
	const totalCaloriesLunch = useMemo(
		() => (targetCalories ? targetCalories * 0.3 : 0),
		[targetCalories]
	)

	const totalCaloriesDinner = useMemo(
		() => (targetCalories ? targetCalories * 0.3 : 0),
		[targetCalories, targetCarbsPercentage, targetProteinPercentage]
	)

	const totalCaloriesSnacks = useMemo(
		() => (targetCalories ? targetCalories * 0.1 : 0),
		[targetCalories, targetCarbsPercentage, targetProteinPercentage]
	)

	const { mealDiaryEntries } = useNutritionData({
		date: selectedDate,
	})

	const { calculateTotal } = useSummary()

	const breakfastSummary = useMemo(
		() => calculateTotal(mealDiaryEntries?.[1] || []),
		[mealDiaryEntries, calculateTotal]
	)
	const lunchSummary = useMemo(
		() => calculateTotal(mealDiaryEntries?.[2] || []),
		[mealDiaryEntries, calculateTotal]
	)
	const dinnerSummary = useMemo(
		() => calculateTotal(mealDiaryEntries?.[3] || []),
		[mealDiaryEntries, calculateTotal]
	)
	const snacksSummary = useMemo(
		() => calculateTotal(mealDiaryEntries?.[4] || []),
		[mealDiaryEntries, calculateTotal]
	)
	const totalSummary = useMemo(
		() => calculateTotal(mealDiaryEntries?.all || []),
		[mealDiaryEntries, calculateTotal]
	)

	const prediction = useMemo(() => {
		if (!mealDiaryEntries || !targetCalories || mealBreakdown.length === 0)
			return null
		return predictDayTotal(mealDiaryEntries, mealBreakdown, targetCalories)
	}, [mealDiaryEntries, mealBreakdown, targetCalories])

	const headerTitle = isToday ? "Today" : formatDate(selectedDate)

	const dateNavLeft = (
		<TouchableOpacity
			style={styles.navButton}
			onPress={goToPrevDay}
			hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
		>
			<Ionicons
				name="chevron-back"
				size={22}
				color={theme.text}
			/>
		</TouchableOpacity>
	)

	const dateNavRight = (
		<View style={styles.dateNavContainer}>
			<TouchableOpacity
				style={styles.navButton}
				onPress={goToNextDay}
				disabled={isToday}
				hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
			>
				<Ionicons
					name="chevron-forward"
					size={22}
					color={isToday ? theme.surface : theme.text}
				/>
			</TouchableOpacity>
			<StreakBadge streak={currentStreak} />
		</View>
	)

	return (
		<View style={styles.mainContainer}>
			<View style={styles.headerRow}>
				<Header
					title={headerTitle}
					sticky
					backgroundColor={theme.background}
					leftComponent={dateNavLeft}
					rightComponent={dateNavRight}
				/>
			</View>
			<ScrollView contentContainerStyle={styles.scrollContainer}>
				<InsightsCard insights={insights} />
				<View style={styles.nutritionSummary}>
					{targetCalories && (
						<NutritionSummary
							eatenCalories={totalSummary.calories}
							totalCalories={targetCalories}
							eatenCarbs={totalSummary.carbs}
							totalCarbs={totalCarbs}
							eatenProtein={totalSummary.protein}
							totalProtein={totalProtein}
							eatenFat={totalSummary.fat}
							totalFat={totalFat}
							projectedCalories={prediction?.projectedTotal}
							macroTargets={
								targetCalories
									? {
											calories: targetCalories,
											protein: totalProtein,
											carbs: totalCarbs,
											fat: totalFat,
										}
									: undefined
							}
						/>
					)}
				</View>
				<View style={styles.mealsSection}>
					<MealsSummary
						meals={[
							{
								eatenCalories: breakfastSummary.calories,
								totalCalories: totalCaloriesBreakfast,
								foods: breakfastSummary.foodsStrings.join(", "),
							},
							{
								eatenCalories: lunchSummary.calories,
								totalCalories: totalCaloriesLunch,
								foods: lunchSummary.foodsStrings.join(", "),
							},
							{
								eatenCalories: dinnerSummary.calories,
								totalCalories: totalCaloriesDinner,
								foods: dinnerSummary.foodsStrings.join(", "),
							},
							{
								eatenCalories: snacksSummary.calories,
								totalCalories: totalCaloriesSnacks,
								foods: snacksSummary.foodsStrings.join(", "),
							},
						]}
					/>
				</View>
			</ScrollView>
		</View>
	)
}
