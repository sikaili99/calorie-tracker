import { Injectable } from "@nestjs/common"
import type {
	CoachRequest,
	ParseFoodRequest,
	AnalyzePhotoRequest,
	WeeklyReportRequest,
	ParsedFoodItem,
	FoodEstimate,
	WeeklyReport,
} from "@calorie-tracker/shared-types"

@Injectable()
export class AiService {
	coach(_dto: CoachRequest): { reply: string } {
		// STUB: real AI logic goes here
		return { reply: "AI coach is coming soon. Keep tracking your meals!" }
	}

	parseFood(_dto: ParseFoodRequest): { foods: ParsedFoodItem[] } {
		// STUB
		return { foods: [] }
	}

	analyzePhoto(_dto: AnalyzePhotoRequest): { foods: FoodEstimate[] } {
		// STUB
		return { foods: [] }
	}

	weeklyReport(_dto: WeeklyReportRequest): WeeklyReport {
		// STUB
		return {
			weekSummary: "Weekly report is coming soon.",
			macroAnalysis: "Macro analysis coming soon.",
			topFoods: [],
			patterns: [],
			recommendations: ["Keep logging your meals!"],
			generatedAt: new Date().toISOString(),
			weekStartDate: new Date(Date.now() - 7 * 864e5)
				.toISOString()
				.split("T")[0],
		}
	}
}
