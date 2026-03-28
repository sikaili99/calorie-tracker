// Shared types between mobile and backend
// Extracted from apps/mobile/api/BackendAPI.ts and apps/mobile/interfaces/WeeklyReport.ts

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
	generatedAt: string // ISO date string
	weekStartDate: string // YYYY-MM-DD
}

// ─── Request shapes for backend endpoints ────────────────────────────────────

export interface CoachRequest {
	messages: ChatMessage[]
	nutritionContext: NutritionContext
}

export interface ParseFoodRequest {
	description: string
	nutritionContext: NutritionContext
}

export interface AnalyzePhotoRequest {
	imageBase64: string
	mealType: number
}

export interface WeeklyReportRequest {
	weekData: {
		date: string
		kcal: number
		protein: number
		carbs: number
		fat: number
	}[]
	targets: {
		calories: number
		protein: number
		carbs: number
		fat: number
	}
}
