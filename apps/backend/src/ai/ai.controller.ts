import { Controller, Post, Body } from "@nestjs/common"
import { AiService } from "./ai.service"
import type {
	CoachRequest,
	ParseFoodRequest,
	AnalyzePhotoRequest,
	WeeklyReportRequest,
} from "@calorie-tracker/shared-types"

@Controller("ai")
export class AiController {
	constructor(private readonly aiService: AiService) {}

	@Post("coach")
	coach(@Body() dto: CoachRequest) {
		return this.aiService.coach(dto)
	}

	@Post("parse-food")
	parseFood(@Body() dto: ParseFoodRequest) {
		return this.aiService.parseFood(dto)
	}

	@Post("analyze-photo")
	analyzePhoto(@Body() dto: AnalyzePhotoRequest) {
		return this.aiService.analyzePhoto(dto)
	}

	@Post("weekly-report")
	weeklyReport(@Body() dto: WeeklyReportRequest) {
		return this.aiService.weeklyReport(dto)
	}
}
