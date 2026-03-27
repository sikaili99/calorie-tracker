import { useState, useRef, useCallback } from "react"
import { Food } from "@/hooks/useDatabase"
import {
	searchByName as searchByNameUsda,
	USDA_API_KEY_DEFAULT,
} from "@/api/UsdaApi"
import { searchByName as searchByNameOpenFoodFacts } from "@/api/OpenFoodFactsAPI"
import { BackendAPI, buildNutritionContext } from "@/api/BackendAPI"
import { useSettings } from "@/providers/SettingsProvider"

export type SearchType = "generic" | "branded" | "ai"

interface SearchState {
	searchQuery: string
	data: Food[]
	isLoading: boolean
	error: string | null
	lastQuery: string | null
}

interface UseSearchResult {
	data: Food[]
	isLoading: boolean
	isError: boolean
	error: string | null
	lastQuery: string | null
	search: (query?: string) => Promise<void>
}

const useSearch = (
	searchFn: (query: string, key: string) => Promise<Food[]>,
	apiKey: string
): UseSearchResult => {
	const [state, setState] = useState<SearchState>({
		searchQuery: "",
		data: [],
		isLoading: false,
		error: null,
		lastQuery: null,
	})

	const requestIdRef = useRef(0)

	const search = useCallback(
		async (searchQuery?: string) => {
			const trimmedQuery = searchQuery?.trim() ?? state.searchQuery

			if (!trimmedQuery) {
				setState((prev) => ({ ...prev, data: [], error: null }))
				return
			}

			requestIdRef.current++
			const currentRequestId = requestIdRef.current

			setState((prev) => ({
				...prev,
				isLoading: true,
				error: null,
				lastQuery: trimmedQuery,
			}))

			try {
				const results = await searchFn(trimmedQuery, apiKey)

				if (currentRequestId === requestIdRef.current) {
					setState((prev) => ({
						...prev,
						data: results,
						isLoading: false,
					}))
				}
			} catch (err) {
				if (currentRequestId === requestIdRef.current) {
					setState((prev) => ({
						...prev,
						error:
							err instanceof Error
								? err.message
								: "Unknown error",
						isLoading: false,
					}))
				}
			}
		},
		[searchFn, apiKey, state.searchQuery]
	)

	return {
		data: state.data,
		isLoading: state.isLoading,
		isError: !!state.error,
		error: state.error,
		lastQuery: state.lastQuery,
		search,
	}
}

const useGenericSearch = () => {
	const { usdaApiKey } = useSettings()
	return useSearch(searchByNameUsda, usdaApiKey ?? USDA_API_KEY_DEFAULT)
}

const useBrandedSearch = () => {
	const { userUuid } = useSettings()
	return useSearch(searchByNameOpenFoodFacts, userUuid ?? "")
}

interface AISearchState {
	data: Food[]
	isLoading: boolean
	error: string | null
	lastQuery: string | null
}

export const useSearchFood = () => {
	const generic = useGenericSearch()
	const branded = useBrandedSearch()
	const { usdaApiKey } = useSettings()

	const [aiState, setAIState] = useState<AISearchState>({
		data: [],
		isLoading: false,
		error: null,
		lastQuery: null,
	})

	const handleAISearch = useCallback(
		async (description: string) => {
			const trimmed = description.trim()
			if (!trimmed) return

			setAIState({
				data: [],
				isLoading: true,
				error: null,
				lastQuery: trimmed,
			})

			try {
				// Use a minimal context (no diary data needed for parsing)
				const context = buildNutritionContext({
					targetCalories: 2200,
					targetProtein: 137,
					targetCarbs: 275,
					targetFat: 61,
					todayCalories: 0,
					todayProtein: 0,
					todayCarbs: 0,
					todayFat: 0,
					recentHistory: [],
					favoriteFoods: [],
				})

				let parsed = await BackendAPI.parseFoodDescription(
					trimmed,
					context
				).catch(() => null)

				// Fallback: treat the whole description as a single search query
				if (!parsed || parsed.length === 0) {
					parsed = [{ searchQuery: trimmed, estimatedGrams: 100 }]
				}

				const apiKey = usdaApiKey ?? USDA_API_KEY_DEFAULT
				const results = await Promise.all(
					parsed.map(async (item) => {
						const foods = await searchByNameUsda(
							item.searchQuery,
							apiKey
						).catch(() => [] as Food[])
						// Attach the estimated quantity as servingQuantity hint
						return foods.slice(0, 3).map((f) => ({
							...f,
							servingQuantity:
								item.estimatedGrams > 0
									? item.estimatedGrams
									: f.servingQuantity,
						}))
					})
				)

				setAIState({
					data: results.flat(),
					isLoading: false,
					error: null,
					lastQuery: trimmed,
				})
			} catch (e) {
				setAIState((prev) => ({
					...prev,
					isLoading: false,
					error: "AI search is unavailable. Check your connection.",
				}))
			}
		},
		[usdaApiKey]
	)

	const handleSearch = useCallback(
		async (type: SearchType, query?: string) => {
			if (type === "generic") {
				await generic.search(query)
			} else if (type === "branded") {
				await branded.search(query)
			} else if (type === "ai" && query) {
				await handleAISearch(query)
			}
		},
		[generic, branded, handleAISearch]
	)

	return {
		generic,
		branded,
		ai: aiState,
		handleSearch,
		handleAISearch,
	}
}
