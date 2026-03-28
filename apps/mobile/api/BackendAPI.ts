import axios from "axios"
import { BACKEND_BASE_URL } from "@/constants/BackendConfig"
import { Food } from "@/hooks/useDatabase"
import { DailySummary } from "@/hooks/useHistoricalData"

// ─── Shared types ────────────────────────────────────────────────────────────

export interface NutritionContext {
	targetCalories: number
	targetProtein: number
	targetCarbs: number
	targetFat: number
	todayCalories: number
	todayProtein: number
	todayCarbs: number
	todayFat: number
	recentDays: { date: string; kcal: number; protein: number }[]
	favoriteFoods: { name: string; calories: number }[]
}

export interface ChatMessage {
	role: "user" | "assistant"
	content: string
}

export interface ParsedFoodItem {
	searchQuery: string
	estimatedGrams: number
}

export interface FoodEstimate {
	name: string
	estimatedGrams: number
	confidence: "high" | "medium" | "low"
}

export interface WeeklyReport {
	weekSummary: string
	macroAnalysis: string
	topFoods: string[]
	patterns: string[]
	recommendations: string[]
}

// ─── Context builder ─────────────────────────────────────────────────────────

export function buildNutritionContext(params: {
	targetCalories: number
	targetProtein: number
	targetCarbs: number
	targetFat: number
	todayCalories: number
	todayProtein: number
	todayCarbs: number
	todayFat: number
	recentHistory: DailySummary[]
	favoriteFoods: Food[]
}): NutritionContext {
	return {
		targetCalories: Math.round(params.targetCalories),
		targetProtein: Math.round(params.targetProtein),
		targetCarbs: Math.round(params.targetCarbs),
		targetFat: Math.round(params.targetFat),
		todayCalories: Math.round(params.todayCalories),
		todayProtein: Math.round(params.todayProtein),
		todayCarbs: Math.round(params.todayCarbs),
		todayFat: Math.round(params.todayFat),
		// Only send last 7 days for conciseness
		recentDays: params.recentHistory.slice(-7).map((d) => ({
			date: d.date,
			kcal: Math.round(d.kcal),
			protein: Math.round(d.protein),
		})),
		favoriteFoods: params.favoriteFoods.slice(0, 10).map((f) => ({
			name: f.name,
			calories: Math.round(
				f.servingQuantity > 0
					? (f.servingQuantity * f.caloriesPer100g) / 100
					: f.caloriesPer100g
			),
		})),
	}
}

// ─── API client ──────────────────────────────────────────────────────────────

const client = axios.create({
	baseURL: BACKEND_BASE_URL,
	timeout: 30000,
	headers: { "Content-Type": "application/json" },
})

export const BackendAPI = {
	async coachMessage(
		messages: ChatMessage[],
		nutritionContext: NutritionContext
	): Promise<string> {
		const response = await client.post<{ reply: string }>("/ai/coach", {
			messages,
			nutritionContext,
		})
		return response.data.reply
	},

	async parseFoodDescription(
		description: string,
		nutritionContext: NutritionContext
	): Promise<ParsedFoodItem[]> {
		const response = await client.post<{ foods: ParsedFoodItem[] }>(
			"/ai/parse-food",
			{ description, nutritionContext }
		)
		return response.data.foods ?? []
	},

	async analyzeMealPhoto(
		imageBase64: string,
		mealType: number
	): Promise<FoodEstimate[]> {
		const response = await client.post<{ foods: FoodEstimate[] }>(
			"/ai/analyze-photo",
			{ imageBase64, mealType }
		)
		return response.data.foods ?? []
	},

	async generateWeeklyReport(
		weekData: DailySummary[],
		targets: {
			calories: number
			protein: number
			carbs: number
			fat: number
		}
	): Promise<WeeklyReport> {
		const response = await client.post<WeeklyReport>(
			"/ai/weekly-report",
			{ weekData, targets }
		)
		return response.data
	},

	async register(
		_name: string,
		_email: string,
		_password: string
	): Promise<void> {
		throw new Error("Auth coming soon")
	},

	async login(_email: string, _password: string): Promise<void> {
		throw new Error("Auth coming soon")
	},
}
