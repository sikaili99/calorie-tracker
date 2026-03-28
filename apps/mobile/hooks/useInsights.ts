import { useMemo } from "react"
import { useHistoricalData } from "./useHistoricalData"
import { useSettings } from "@/providers/SettingsProvider"
import { computeInsights, NutritionTargets } from "@/utils/insightRules"

export const useInsights = () => {
	const { dailySummaries } = useHistoricalData(30)
	const {
		targetCalories,
		targetCarbsPercentage,
		targetProteinPercentage,
		targetFatPercentage,
	} = useSettings()

	const targets: NutritionTargets | null = useMemo(() => {
		if (
			!targetCalories ||
			!targetCarbsPercentage ||
			!targetProteinPercentage ||
			!targetFatPercentage
		)
			return null
		return {
			calories: targetCalories,
			protein: (targetCalories * targetProteinPercentage) / 100 / 4,
			carbs: (targetCalories * targetCarbsPercentage) / 100 / 4,
			fat: (targetCalories * targetFatPercentage) / 100 / 9,
		}
	}, [
		targetCalories,
		targetCarbsPercentage,
		targetProteinPercentage,
		targetFatPercentage,
	])

	const insights = useMemo(() => {
		if (!targets) return []
		return computeInsights(dailySummaries, targets)
	}, [dailySummaries, targets])

	return { insights }
}
