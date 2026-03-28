import { useState, useCallback } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useDatabase, ISODateString, toISODateString } from "./useDatabase"
import { useSettings } from "@/providers/SettingsProvider"
import { BackendAPI } from "@/api/BackendAPI"
import { WeeklyReport } from "@/interfaces/WeeklyReport"

function getISOWeekStart(date: Date): ISODateString {
	const d = new Date(date)
	// Monday-based week
	const day = d.getUTCDay() || 7
	d.setUTCDate(d.getUTCDate() - day + 1)
	return toISODateString(d)
}

function storageKey(weekStart: string) {
	return `WEEKLY_REPORT_${weekStart}`
}

export const useWeeklyReport = () => {
	const { fetchWeeklyData } = useDatabase()
	const {
		targetCalories,
		targetCarbsPercentage,
		targetProteinPercentage,
		targetFatPercentage,
	} = useSettings()

	const [report, setReport] = useState<WeeklyReport | null>(null)
	const [isGenerating, setIsGenerating] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const loadCached = useCallback(
		async (weekStart: string): Promise<WeeklyReport | null> => {
			try {
				const stored = await AsyncStorage.getItem(
					storageKey(weekStart)
				)
				if (stored) return JSON.parse(stored) as WeeklyReport
			} catch {}
			return null
		},
		[]
	)

	const generateReport = useCallback(
		async (forDate?: Date) => {
			const date = forDate ?? new Date()
			const weekStart = getISOWeekStart(date)

			// Check cache first
			const cached = await loadCached(weekStart)
			if (cached) {
				setReport(cached)
				return
			}

			if (
				!targetCalories ||
				!targetCarbsPercentage ||
				!targetProteinPercentage ||
				!targetFatPercentage
			)
				return

			setIsGenerating(true)
			setError(null)

			try {
				const weekData = await fetchWeeklyData(weekStart)

				const targets = {
					calories: targetCalories,
					protein:
						(targetCalories * targetProteinPercentage) / 100 / 4,
					carbs: (targetCalories * targetCarbsPercentage) / 100 / 4,
					fat: (targetCalories * targetFatPercentage) / 100 / 9,
				}

				const result = await BackendAPI.generateWeeklyReport(
					weekData,
					targets
				)

				const fullReport: WeeklyReport = {
					...result,
					generatedAt: new Date().toISOString(),
					weekStartDate: weekStart,
				}

				await AsyncStorage.setItem(
					storageKey(weekStart),
					JSON.stringify(fullReport)
				)
				setReport(fullReport)
			} catch (e) {
				setError(
					"Could not generate report. Check your connection."
				)
			} finally {
				setIsGenerating(false)
			}
		},
		[
			fetchWeeklyData,
			targetCalories,
			targetCarbsPercentage,
			targetProteinPercentage,
			targetFatPercentage,
			loadCached,
		]
	)

	const loadForDate = useCallback(
		async (date: Date) => {
			const weekStart = getISOWeekStart(date)
			const cached = await loadCached(weekStart)
			if (cached) setReport(cached)
			else setReport(null)
		},
		[loadCached]
	)

	return { report, isGenerating, error, generateReport, loadForDate }
}
