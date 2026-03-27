import { Food } from "@/hooks/useDatabase"

export interface MacroGaps {
	protein: number
	carbs: number
	fat: number
}

/**
 * Scores and ranks foods for the "Suggested for you" section.
 * Score = meal-type match (40%) + macro fit (40%) + base usage (20%)
 *
 * @param foods - Pre-ranked foods from DB (already ordered by meal_type_score DESC)
 * @param macroGaps - Remaining grams of each macro for the day
 * @param usageScores - usage_count per food id (positional, same order as foods)
 */
export function scoreAndRankFoods(
	foods: Food[],
	macroGaps: MacroGaps,
	maxUsageCount = 10
): Food[] {
	if (foods.length === 0) return []

	const totalGap =
		Math.abs(macroGaps.protein) +
		Math.abs(macroGaps.carbs) +
		Math.abs(macroGaps.fat)

	const scored = foods.map((food, idx) => {
		// Meal-type match score — foods earlier in the list already have higher
		// meal_type_score from DB, so use inverse position as proxy (0-1 range)
		const mealTypeScore = 1 - idx / foods.length

		// Macro fit: how well does one serving of this food fill remaining gaps?
		let macroFitScore = 0
		if (totalGap > 0 && food.servingQuantity > 0) {
			const servingProtein =
				(food.servingQuantity * food.proteinPer100g) / 100
			const servingCarbs =
				(food.servingQuantity * food.carbsPer100g) / 100
			const servingFat = (food.servingQuantity * food.fatPer100g) / 100

			const proteinFit =
				macroGaps.protein > 0
					? Math.min(servingProtein / macroGaps.protein, 1)
					: 0
			const carbsFit =
				macroGaps.carbs > 0
					? Math.min(servingCarbs / macroGaps.carbs, 1)
					: 0
			const fatFit =
				macroGaps.fat > 0
					? Math.min(servingFat / macroGaps.fat, 1)
					: 0
			macroFitScore = (proteinFit + carbsFit + fatFit) / 3
		}

		// Recency / usage score — normalised 0-1 by max possible
		const usageScore = 1 - idx / Math.max(foods.length, maxUsageCount)

		const total =
			mealTypeScore * 0.4 + macroFitScore * 0.4 + usageScore * 0.2

		return { food, score: total }
	})

	scored.sort((a, b) => b.score - a.score)
	return scored.map((s) => s.food)
}
