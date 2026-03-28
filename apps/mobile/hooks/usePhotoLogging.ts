import { useState, useCallback } from "react"
import { BackendAPI } from "@/api/BackendAPI"
import { searchByName } from "@/api/UsdaApi"
import { PhotoLogItemData } from "@/components/diaryPage/PhotoLogItem"

export const usePhotoLogging = () => {
	const [items, setItems] = useState<PhotoLogItemData[]>([])
	const [isAnalyzing, setIsAnalyzing] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const analyzePhoto = useCallback(
		async (imageBase64: string, mealType: number) => {
			setIsAnalyzing(true)
			setError(null)
			setItems([])

			try {
				const estimates = await BackendAPI.analyzeMealPhoto(
					imageBase64,
					mealType
				)

				// Fan out USDA food searches in parallel
				const resolved = await Promise.all(
					estimates.map(async (est) => {
						try {
							const results = await searchByName(est.name)
							const food = results.length > 0 ? results[0] : null
							return {
								estimatedGrams: est.estimatedGrams,
								confidence: est.confidence,
								food,
								rawName: est.name,
							} satisfies PhotoLogItemData
						} catch {
							return {
								estimatedGrams: est.estimatedGrams,
								confidence: est.confidence,
								food: null,
								rawName: est.name,
							} satisfies PhotoLogItemData
						}
					})
				)

				setItems(resolved)
			} catch {
				setError(
					"Could not analyze photo. Make sure your backend is running."
				)
			} finally {
				setIsAnalyzing(false)
			}
		},
		[]
	)

	const removeItem = useCallback((index: number) => {
		setItems((prev) => prev.filter((_, i) => i !== index))
	}, [])

	const updateGrams = useCallback((index: number, grams: number) => {
		setItems((prev) =>
			prev.map((item, i) =>
				i === index ? { ...item, estimatedGrams: grams } : item
			)
		)
	}, [])

	return { items, isAnalyzing, error, analyzePhoto, removeItem, updateGrams }
}
