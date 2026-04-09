import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import Anthropic from "@anthropic-ai/sdk"
import type {
	CoachRequest,
	ParseFoodRequest,
	AnalyzePhotoRequest,
	WeeklyReportRequest,
	ParsedFoodItem,
	FoodEstimate,
	WeeklyReport,
} from "@calorie-tracker/shared-types"

const HAIKU = "claude-haiku-4-5-20251001"
const SONNET = "claude-sonnet-4-6"

function stripJsonFences(text: string): string {
	return text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim()
}

@Injectable()
export class AiService {
	private readonly anthropic: Anthropic

	constructor(private readonly configService: ConfigService) {
		const apiKey = this.configService.get<string>("ANTHROPIC_API_KEY")
		if (!apiKey) {
			throw new Error("ANTHROPIC_API_KEY is required")
		}
		this.anthropic = new Anthropic({ apiKey })
	}

	async coach(dto: CoachRequest): Promise<{ reply: string }> {
		const ctx = dto.nutritionContext
		const remainingKcal = ctx.targetCalories - ctx.todayCalories
		const recentHistory = ctx.recentDays
			.map((d) => `  ${d.date}: ${d.kcal} kcal, ${d.protein}g protein`)
			.join("\n")
		const favFoods = ctx.favoriteFoods
			.map((f) => `${f.name} (~${f.calories} kcal)`)
			.join(", ")

		const systemPrompt = `You are a personal nutrition coach. Your goal is to help the user stay on track with their nutrition.

Today's nutrition:
- Goal: ${ctx.targetCalories} kcal | Protein ${ctx.targetProtein}g | Carbs ${ctx.targetCarbs}g | Fat ${ctx.targetFat}g
- Logged so far: ${ctx.todayCalories} kcal | Protein ${ctx.todayProtein}g | Carbs ${ctx.todayCarbs}g | Fat ${ctx.todayFat}g
- Remaining: ${remainingKcal} kcal

Recent history (last 7 days):
${recentHistory || "  No recent data"}

Favourite foods: ${favFoods || "None logged yet"}

Guidelines:
- Keep responses concise (2-4 sentences max unless the user asks for a detailed plan).
- Be encouraging and practical.
- Reference the user's actual data when relevant.
- Never invent meal macros — use approximations only.`

		const response = await this.anthropic.messages.create({
			model: SONNET,
			max_tokens: 1024,
			system: systemPrompt,
			messages: dto.messages.map((m) => ({
				role: m.role,
				content: m.content,
			})),
		})

		const reply =
			response.content[0]?.type === "text"
				? response.content[0].text
				: "I'm here to help you with your nutrition goals!"

		return { reply }
	}

	async parseFood(dto: ParseFoodRequest): Promise<{ foods: ParsedFoodItem[] }> {
		const response = await this.anthropic.messages.create({
			model: HAIKU,
			max_tokens: 512,
			system: `You are a food nutrition parser. Given a food description, identify each distinct food item and return a JSON array.
Each object must have:
  - searchQuery: string (a clean, searchable food name — e.g., "grilled chicken breast", "white rice")
  - estimatedGrams: number (your best estimate of the gram weight for the described portion)
Return ONLY a raw JSON array. No markdown. No explanation. If no food is mentioned, return [].`,
			messages: [
				{
					role: "user",
					content: `Parse this food description: "${dto.description}"`,
				},
			],
		})

		const text =
			response.content[0]?.type === "text" ? response.content[0].text : "[]"

		try {
			const parsed = JSON.parse(stripJsonFences(text))
			return { foods: Array.isArray(parsed) ? parsed : [] }
		} catch {
			return { foods: [] }
		}
	}

	async analyzePhoto(dto: AnalyzePhotoRequest): Promise<{ foods: FoodEstimate[] }> {
		const base64Data = dto.imageBase64.replace(/^data:[^;]+;base64,/, "")

		const response = await this.anthropic.messages.create({
			model: HAIKU,
			max_tokens: 1024,
			system: `You are a meal photo analyzer. Identify every food item visible in the photo.
Return a JSON array where each object has:
  - name: string (specific food name, e.g., "grilled salmon fillet", "steamed broccoli")
  - estimatedGrams: number (visual weight estimate in grams)
  - confidence: "high" | "medium" | "low"
Return ONLY a raw JSON array. No markdown. No explanation. If the image is not food, return [].`,
			messages: [
				{
					role: "user",
					content: [
						{
							type: "image",
							source: {
								type: "base64",
								media_type: "image/jpeg",
								data: base64Data,
							},
						},
						{
							type: "text",
							text: "Analyze this meal photo.",
						},
					],
				},
			],
		})

		const text =
			response.content[0]?.type === "text" ? response.content[0].text : "[]"

		try {
			const parsed = JSON.parse(stripJsonFences(text))
			return { foods: Array.isArray(parsed) ? parsed : [] }
		} catch {
			return { foods: [] }
		}
	}

	async weeklyReport(dto: WeeklyReportRequest): Promise<WeeklyReport> {
		const weekTable = dto.weekData
			.map(
				(d) =>
					`  ${d.date}: ${d.kcal} kcal | P: ${d.protein}g | C: ${d.carbs}g | F: ${d.fat}g`
			)
			.join("\n")

		const weekStartDate = dto.weekData[0]?.date ?? new Date().toISOString().split("T")[0]

		const userMessage = `Analyze this week of nutrition data:

Week data:
${weekTable}

Daily targets: ${dto.targets.calories} kcal | Protein ${dto.targets.protein}g | Carbs ${dto.targets.carbs}g | Fat ${dto.targets.fat}g`

		const response = await this.anthropic.messages.create({
			model: SONNET,
			max_tokens: 2048,
			system: `You are a nutrition analyst. Analyze a week of food logging and return a structured JSON report.

The JSON object must have exactly these keys:
  - weekSummary: string (2-3 sentence overview of the week)
  - macroAnalysis: string (analysis of macro balance vs targets)
  - topFoods: string[] (up to 5 observations about food patterns, each a short phrase)
  - patterns: string[] (up to 3 behavioral patterns observed, e.g., "Skipped protein on weekends")
  - recommendations: string[] (3-5 actionable recommendations)

Return ONLY a raw JSON object. No markdown. No explanation.`,
			messages: [{ role: "user", content: userMessage }],
		})

		const text =
			response.content[0]?.type === "text" ? response.content[0].text : "{}"

		try {
			const parsed = JSON.parse(stripJsonFences(text))
			return {
				weekSummary: parsed.weekSummary ?? "Unable to generate summary.",
				macroAnalysis: parsed.macroAnalysis ?? "Unable to analyze macros.",
				topFoods: Array.isArray(parsed.topFoods) ? parsed.topFoods : [],
				patterns: Array.isArray(parsed.patterns) ? parsed.patterns : [],
				recommendations: Array.isArray(parsed.recommendations)
					? parsed.recommendations
					: ["Keep logging your meals!"],
				generatedAt: new Date().toISOString(),
				weekStartDate,
			}
		} catch {
			return {
				weekSummary: "Unable to generate weekly report.",
				macroAnalysis: "Unable to analyze macros.",
				topFoods: [],
				patterns: [],
				recommendations: ["Keep logging your meals!"],
				generatedAt: new Date().toISOString(),
				weekStartDate,
			}
		}
	}
}
