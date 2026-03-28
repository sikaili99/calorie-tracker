import { useState, useEffect, useCallback } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useDatabase } from "./useDatabase"
import { useSettings } from "@/providers/SettingsProvider"

const DISMISSED_KEY = "TARGET_SUGGESTION_DISMISSED"

export interface TargetSuggestion {
	suggestedCalories: number
	currentCalories: number
	daysLogged: number
	avgCalories: number
}

export const useTargetSuggestions = () => {
	const { fetchAverageIntake } = useDatabase()
	const { targetCalories } = useSettings()
	const [suggestion, setSuggestion] = useState<TargetSuggestion | null>(null)
	const [dismissed, setDismissed] = useState(false)

	const check = useCallback(async () => {
		if (!targetCalories) return

		// Check if dismissed this week
		try {
			const stored = await AsyncStorage.getItem(DISMISSED_KEY)
			if (stored) {
				const { dismissedAt } = JSON.parse(stored)
				const daysSince =
					(Date.now() - new Date(dismissedAt).getTime()) /
					(1000 * 60 * 60 * 24)
				if (daysSince < 7) {
					setDismissed(true)
					return
				}
			}
		} catch {}

		try {
			const avg = await fetchAverageIntake(14)
			if (!avg || avg.days_logged < 10 || !avg.avg_kcal) return

			const diff = Math.abs(avg.avg_kcal - targetCalories)
			const diffPct = diff / targetCalories

			if (diffPct > 0.15) {
				// Round to nearest 50
				const suggested =
					Math.round(avg.avg_kcal / 50) * 50

				setSuggestion({
					suggestedCalories: suggested,
					currentCalories: targetCalories,
					daysLogged: avg.days_logged,
					avgCalories: Math.round(avg.avg_kcal),
				})
			}
		} catch (e) {
			console.error("useTargetSuggestions:", e)
		}
	}, [fetchAverageIntake, targetCalories])

	useEffect(() => {
		check()
	}, [check])

	const dismiss = useCallback(async () => {
		setSuggestion(null)
		setDismissed(true)
		await AsyncStorage.setItem(
			DISMISSED_KEY,
			JSON.stringify({ dismissedAt: new Date().toISOString() })
		).catch(() => {})
	}, [])

	if (dismissed) return { suggestion: null, dismiss }
	return { suggestion, dismiss }
}
