export type ActivityLevel =
	| "sedentary"
	| "light"
	| "moderate"
	| "active"
	| "very_active"
export type GoalType = "lose" | "maintain" | "gain"

export interface TDEEResult {
	calories: number
	proteinPct: number
	carbsPct: number
	fatPct: number
}

const activityMultipliers: Record<ActivityLevel, number> = {
	sedentary: 1.2,
	light: 1.375,
	moderate: 1.55,
	active: 1.725,
	very_active: 1.9,
}

export function calculateTDEE(
	age: number,
	weightKg: number,
	heightCm: number,
	activityLevel: ActivityLevel,
	goalType: GoalType
): TDEEResult {
	// Gender-neutral average of Mifflin-St Jeor male + female formulas
	const bmrMale = 10 * weightKg + 6.25 * heightCm - 5 * age + 5
	const bmrFemale = 10 * weightKg + 6.25 * heightCm - 5 * age - 161
	const bmr = (bmrMale + bmrFemale) / 2

	const tdee = bmr * activityMultipliers[activityLevel]

	const goalAdjustment = goalType === "lose" ? -500 : goalType === "gain" ? 300 : 0
	const calories = Math.max(1200, Math.round(tdee + goalAdjustment))

	// Macro splits by goal: lose (35/40/25), maintain (25/50/25), gain (30/45/25)
	const macros =
		goalType === "lose"
			? { proteinPct: 35, carbsPct: 40, fatPct: 25 }
			: goalType === "gain"
				? { proteinPct: 30, carbsPct: 45, fatPct: 25 }
				: { proteinPct: 25, carbsPct: 50, fatPct: 25 }

	return { calories, ...macros }
}
