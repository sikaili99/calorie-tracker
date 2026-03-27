import { useState, useCallback, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import {
	BackendAPI,
	ChatMessage,
	buildNutritionContext,
} from "@/api/BackendAPI"
import { useSettings } from "@/providers/SettingsProvider"
import { useHistoricalData } from "./useHistoricalData"
import { useDatabase } from "./useDatabase"

const STORAGE_KEY = "COACH_HISTORY"
const MAX_MESSAGES = 20

export const useCoach = (todaySummary: {
	calories: number
	protein: number
	carbs: number
	fat: number
}) => {
	const [messages, setMessages] = useState<ChatMessage[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const {
		targetCalories,
		targetCarbsPercentage,
		targetProteinPercentage,
		targetFatPercentage,
	} = useSettings()

	const { dailySummaries } = useHistoricalData(7)
	const { fetchFavoriteFoods } = useDatabase()

	// Load persisted messages
	useEffect(() => {
		AsyncStorage.getItem(STORAGE_KEY)
			.then((stored) => {
				if (stored) setMessages(JSON.parse(stored))
			})
			.catch(() => {})
	}, [])

	const persist = useCallback(async (msgs: ChatMessage[]) => {
		await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(msgs)).catch(
			() => {}
		)
	}, [])

	const sendMessage = useCallback(
		async (text: string) => {
			if (!text.trim()) return

			const userMsg: ChatMessage = { role: "user", content: text.trim() }
			const updated = [...messages, userMsg].slice(-MAX_MESSAGES)
			setMessages(updated)
			await persist(updated)

			setIsLoading(true)
			setError(null)

			try {
				const favorites = await fetchFavoriteFoods()

				const targetProtein = targetCalories && targetProteinPercentage
					? (targetCalories * targetProteinPercentage) / 100 / 4
					: 50
				const targetCarbs = targetCalories && targetCarbsPercentage
					? (targetCalories * targetCarbsPercentage) / 100 / 4
					: 250
				const targetFat = targetCalories && targetFatPercentage
					? (targetCalories * targetFatPercentage) / 100 / 9
					: 70

				const context = buildNutritionContext({
					targetCalories: targetCalories ?? 2200,
					targetProtein,
					targetCarbs,
					targetFat,
					todayCalories: todaySummary.calories,
					todayProtein: todaySummary.protein,
					todayCarbs: todaySummary.carbs,
					todayFat: todaySummary.fat,
					recentHistory: dailySummaries,
					favoriteFoods: favorites,
				})

				const reply = await BackendAPI.coachMessage(updated, context)
				const assistantMsg: ChatMessage = {
					role: "assistant",
					content: reply,
				}
				const withReply = [...updated, assistantMsg].slice(-MAX_MESSAGES)
				setMessages(withReply)
				await persist(withReply)
			} catch (e) {
				setError("Could not reach the AI server. Check your connection.")
			} finally {
				setIsLoading(false)
			}
		},
		[
			messages,
			todaySummary,
			dailySummaries,
			targetCalories,
			targetCarbsPercentage,
			targetProteinPercentage,
			targetFatPercentage,
			fetchFavoriteFoods,
			persist,
		]
	)

	const clearHistory = useCallback(async () => {
		setMessages([])
		await AsyncStorage.removeItem(STORAGE_KEY).catch(() => {})
	}, [])

	return { messages, isLoading, error, sendMessage, clearHistory }
}
