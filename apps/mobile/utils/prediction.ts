import { MealsDistribution } from "@/interfaces/Meals"
import { DiaryEntry } from "@/hooks/useDatabase"
import { MealDayRecord } from "@/hooks/useHistoricalData"

export type PredictionConfidence = "low" | "medium" | "high"

export interface DayPrediction {
	projectedTotal: number
	confidence: PredictionConfidence
}

/**
 * Predicts the day's total calorie intake based on:
 * - Already-logged meals (taken as-is)
 * - Remaining meals estimated from historical averages for that meal type
 */
export function predictDayTotal(
	todayEntries: MealsDistribution<DiaryEntry[]>,
	mealHistory: MealDayRecord[],
	targetCalories: number
): DayPrediction | null {
	// Need at least 5 historical days for a useful prediction
	const uniqueDays = new Set(mealHistory.map((r) => r.date))
	if (uniqueDays.size < 5) return null

	// Compute per-meal-type average from history
	const mealAvgs: Record<number, number> = {}
	for (let mealType = 1; mealType <= 4; mealType++) {
		const records = mealHistory.filter((r) => r.meal_type === mealType)
		if (records.length === 0) {
			// Fall back to a proportional share of the target
			const defaults: Record<number, number> = {
				1: 0.3,
				2: 0.3,
				3: 0.3,
				4: 0.1,
			}
			mealAvgs[mealType] = targetCalories * defaults[mealType]
		} else {
			mealAvgs[mealType] =
				records.reduce((s, r) => s + r.meal_kcal, 0) / records.length
		}
	}

	// Sum logged meals; for empty meals use the historical average
	let projected = 0
	for (let mealType = 1; mealType <= 4; mealType++) {
		const loggedEntries = todayEntries[mealType as 1 | 2 | 3 | 4] ?? []
		if (loggedEntries.length > 0) {
			projected += loggedEntries.reduce((s, e) => s + e.kcalTotal, 0)
		} else {
			projected += mealAvgs[mealType]
		}
	}

	const confidence: PredictionConfidence =
		uniqueDays.size >= 14 ? "high" : uniqueDays.size >= 7 ? "medium" : "low"

	return { projectedTotal: Math.round(projected), confidence }
}
