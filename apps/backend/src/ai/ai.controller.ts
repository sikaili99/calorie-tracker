import { Controller, Post, Body, UseGuards } from "@nestjs/common"
import { AiService } from "./ai.service"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { PremiumGuard } from "../premium/premium.guard"
import type {
	CoachRequest,
	ParseFoodRequest,
	AnalyzePhotoRequest,
	WeeklyReportRequest,
} from "@calorie-tracker/shared-types"

@Controller("ai")
@UseGuards(JwtAuthGuard, PremiumGuard)
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
