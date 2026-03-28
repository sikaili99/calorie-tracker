import { DailySummary } from "@/hooks/useHistoricalData"

export interface NutritionTargets {
	calories: number
	protein: number
	carbs: number
	fat: number
}

export interface Insight {
	id: string
	type: "warning" | "positive" | "info"
	title: string
	body: string
	icon: string
}

function getDayOfWeek(dateStr: string): number {
	// Returns 0=Sun, 1=Mon ... 6=Sat
	const d = new Date(dateStr)
	return d.getUTCDay()
}

function isWeekday(dateStr: string): boolean {
	const day = getDayOfWeek(dateStr)
	return day >= 1 && day <= 5
}

export function computeInsights(
	history: DailySummary[],
	targets: NutritionTargets
): Insight[] {
	if (history.length < 3) return []

	const insights: Insight[] = []

	// Rule 1: Low protein on weekdays
	const weekdayEntries = history.filter((d) => isWeekday(d.date))
	if (weekdayEntries.length >= 3) {
		const lowProteinDays = weekdayEntries.filter(
			(d) => d.protein < targets.protein * 0.7
		)
		if (lowProteinDays.length >= 3) {
			const avgProtein = Math.round(
				weekdayEntries.reduce((s, d) => s + d.protein, 0) /
					weekdayEntries.length
			)
			insights.push({
				id: "low_protein_weekdays",
				type: "warning",
				title: "Low Weekday Protein",
				body: `You average ${avgProtein}g protein on weekdays — ${Math.round(targets.protein - avgProtein)}g below your goal.`,
				icon: "barbell-outline",
			})
		}
	}

	// Rule 2: Missing days (2+ consecutive gaps)
	const sortedDates = [...history]
		.map((d) => d.date)
		.sort()
	let maxGap = 0
	for (let i = 1; i < sortedDates.length; i++) {
		const prev = new Date(sortedDates[i - 1])
		const curr = new Date(sortedDates[i])
		const gap = Math.floor(
			(curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
		)
		maxGap = Math.max(maxGap, gap)
	}
	if (maxGap >= 2) {
		insights.push({
			id: "missing_days",
			type: "info",
			title: "Tracking Gaps",
			body: `You had ${maxGap}-day gaps in your log. Consistent tracking gives better insights.`,
			icon: "calendar-outline",
		})
	}

	// Rule 3: Consistent calorie overage
	const recent = history.slice(-7)
	if (recent.length >= 5) {
		const overageDays = recent.filter(
			(d) => d.kcal > targets.calories * 1.05
		)
		if (overageDays.length >= 5) {
			const avgOver = Math.round(
				overageDays.reduce(
					(s, d) => s + (d.kcal - targets.calories),
					0
				) / overageDays.length
			)
			insights.push({
				id: "consistent_overage",
				type: "warning",
				title: "Over Target This Week",
				body: `You've exceeded your calorie goal ${overageDays.length} of the last 7 days by ~${avgOver} kcal/day.`,
				icon: "trending-up-outline",
			})
		}

		// Rule 4: Consistent deficit
		const deficitDays = recent.filter(
			(d) => d.kcal < targets.calories * 0.8
		)
		if (deficitDays.length >= 5) {
			insights.push({
				id: "consistent_deficit",
				type: "info",
				title: "Large Deficit This Week",
				body: `You've eaten under 80% of your calorie goal ${deficitDays.length} of the last 7 days. Make sure this is intentional.`,
				icon: "trending-down-outline",
			})
		}
	}

	// Rule 5: Positive — on track this week
	if (recent.length >= 5 && insights.length === 0) {
		const onTrackDays = recent.filter(
			(d) =>
				d.kcal >= targets.calories * 0.85 &&
				d.kcal <= targets.calories * 1.1
		)
		if (onTrackDays.length >= 4) {
			insights.push({
				id: "on_track",
				type: "positive",
				title: "Great consistency!",
				body: `You hit your calorie goal ${onTrackDays.length} out of ${recent.length} days this week. Keep it up!`,
				icon: "checkmark-circle-outline",
			})
		}
	}

	return insights
}
