import { Module } from "@nestjs/common"
import { DiaryController } from "./diary.controller"
import { DiaryService } from "./diary.service"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"

@Module({
	controllers: [DiaryController],
	providers: [DiaryService, JwtAuthGuard],
})
export class DiaryModule {}
