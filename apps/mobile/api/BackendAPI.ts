import axios from "axios"
import { BACKEND_BASE_URL } from "@/constants/BackendConfig"
import { Food } from "@/hooks/useDatabase"
import { DailySummary } from "@/hooks/useHistoricalData"
import { tokenStorage } from "@/utils/tokenStorage"
import type {
	AuthResponse,
	AuthUser,
	SyncEntriesRequest,
	SyncEntriesResponse,
	SyncFavoritesRequest,
	RemoteDiaryEntry,
} from "@calorie-tracker/shared-types"

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

// Attach access token to every request
client.interceptors.request.use(async (config) => {
	const token = await tokenStorage.getAccessToken()
	if (token) {
		config.headers.Authorization = `Bearer ${token}`
	}
	return config
})

// On 401: attempt silent token refresh, then retry once
let isRefreshing = false
let refreshQueue: Array<(token: string) => void> = []

client.interceptors.response.use(
	(response) => response,
	async (error) => {
		const original = error.config
		if (error.response?.status !== 401 || original._retry) {
			return Promise.reject(error)
		}
		original._retry = true

		if (isRefreshing) {
			return new Promise((resolve) => {
				refreshQueue.push((token: string) => {
					original.headers.Authorization = `Bearer ${token}`
					resolve(client(original))
				})
			})
		}

		isRefreshing = true
		try {
			const refreshToken = await tokenStorage.getRefreshToken()
			if (!refreshToken) throw new Error("No refresh token")
			const { accessToken, refreshToken: newRefresh } =
				await BackendAPI.refreshTokens(refreshToken)
			await tokenStorage.saveTokens(accessToken, newRefresh)
			refreshQueue.forEach((cb) => cb(accessToken))
			refreshQueue = []
			original.headers.Authorization = `Bearer ${accessToken}`
			return client(original)
		} catch (refreshError) {
			await tokenStorage.clearTokens()
			refreshQueue = []
			return Promise.reject(refreshError)
		} finally {
			isRefreshing = false
		}
	}
)

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
		firstName: string,
		lastName: string,
		email: string,
		password: string
	): Promise<AuthResponse> {
		const response = await client.post<AuthResponse>("/auth/register", {
			firstName,
			lastName,
			email,
			password,
		})
		return response.data
	},

	async login(email: string, password: string): Promise<AuthResponse> {
		const response = await client.post<AuthResponse>("/auth/login", {
			email,
			password,
		})
		return response.data
	},

	async googleAuth(idToken: string): Promise<AuthResponse> {
		const response = await client.post<AuthResponse>("/auth/google", {
			idToken,
		})
		return response.data
	},

	async refreshTokens(refreshToken: string): Promise<AuthResponse> {
		// Use a raw axios call to avoid interceptor loop
		const response = await axios.post<AuthResponse>(
			`${BACKEND_BASE_URL}/auth/refresh`,
			{ refreshToken },
			{ headers: { "Content-Type": "application/json" } }
		)
		return response.data
	},

	async getMe(): Promise<AuthUser> {
		const response = await client.get<AuthUser>("/auth/me")
		return response.data
	},

	async logout(refreshToken: string): Promise<void> {
		await client.post("/auth/logout", { refreshToken })
	},

	async syncDiaryEntries(
		dto: SyncEntriesRequest
	): Promise<SyncEntriesResponse> {
		const response = await client.post<SyncEntriesResponse>(
			"/diary/sync",
			dto
		)
		return response.data
	},

	async pullDiaryEntries(since?: string): Promise<RemoteDiaryEntry[]> {
		const response = await client.get<RemoteDiaryEntry[]>("/diary/pull", {
			params: since ? { since } : undefined,
		})
		return response.data
	},

	async syncFavorites(dto: SyncFavoritesRequest): Promise<void> {
		await client.post("/diary/favorites/sync", dto)
	},
}
