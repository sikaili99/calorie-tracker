import { useState, useCallback, useEffect } from "react"
import { useFocusEffect } from "expo-router"
import { useDatabase, ISODateString } from "./useDatabase"

export interface DailySummary {
	date: ISODateString
	kcal: number
	protein: number
	carbs: number
	fat: number
}

export interface MealDayRecord {
	date: ISODateString
	meal_type: number
	meal_kcal: number
}

export const useHistoricalData = (days = 30) => {
	const { fetchHistoricalEntries, fetchMealBreakdownHistory } = useDatabase()
	const [dailySummaries, setDailySummaries] = useState<DailySummary[]>([])
	const [mealBreakdown, setMealBreakdown] = useState<MealDayRecord[]>([])

	const refresh = useCallback(async () => {
		try {
			const [summaries, breakdown] = await Promise.all([
				fetchHistoricalEntries(days),
				fetchMealBreakdownHistory(days),
			])
			setDailySummaries(summaries)
			setMealBreakdown(breakdown)
		} catch (e) {
			console.error("useHistoricalData: failed to fetch", e)
		}
	}, [fetchHistoricalEntries, fetchMealBreakdownHistory, days])

	useEffect(() => {
		refresh()
	}, [refresh])

	useFocusEffect(useCallback(() => { refresh() }, [refresh]))

	return { dailySummaries, mealBreakdown, refresh }
}
