export interface MacroSummary {
	calories: number
	protein: number
	carbs: number
	fat: number
}

export interface MacroTargets {
	calories: number
	protein: number
	carbs: number
	fat: number
}

export function getMacroAdvice(
	eaten: MacroSummary,
	targets: MacroTargets
): string {
	const calorieProgress = targets.calories > 0 ? eaten.calories / targets.calories : 0

	// Only give macro advice once the user has logged at least 30% of calories
	if (calorieProgress < 0.3) {
		return "Start logging meals to see your macro balance."
	}

	const proteinGap = targets.protein - eaten.protein
	const carbsGap = targets.carbs - eaten.carbs
	const fatGap = targets.fat - eaten.fat

	// Find the most off-track macro
	if (proteinGap > 0 && proteinGap / targets.protein > 0.2) {
		return `${Math.round(proteinGap)}g protein remaining — try chicken, eggs, or Greek yogurt.`
	}
	if (carbsGap < 0 && Math.abs(carbsGap) / targets.carbs > 0.15) {
		return `Carbs are ${Math.round(Math.abs(carbsGap))}g over target. Consider lighter options.`
	}
	if (fatGap < 0 && Math.abs(fatGap) / targets.fat > 0.2) {
		return `Fat is ${Math.round(Math.abs(fatGap))}g over target today.`
	}
	if (carbsGap > 0 && carbsGap / targets.carbs > 0.3) {
		return `${Math.round(carbsGap)}g carbs remaining — room for grains, fruit, or veg.`
	}

	return "Great macro balance today! Keep it up."
}
