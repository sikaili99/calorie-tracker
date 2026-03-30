import {
	Controller,
	Post,
	Delete,
	Get,
	Body,
	Param,
	Query,
	HttpCode,
	HttpStatus,
	UseGuards,
	Request,
} from "@nestjs/common"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { DiaryService } from "./diary.service"
import type {
	SyncEntriesRequest,
	SyncFavoritesRequest,
	AuthUser,
} from "@calorie-tracker/shared-types"

@Controller("diary")
@UseGuards(JwtAuthGuard)
export class DiaryController {
	constructor(private readonly diaryService: DiaryService) {}

	@Post("sync")
	@HttpCode(HttpStatus.OK)
	sync(
		@Request() req: { user: AuthUser },
		@Body() dto: SyncEntriesRequest
	) {
		return this.diaryService.syncEntries(req.user.id, dto)
	}

	@Delete(":localId")
	@HttpCode(HttpStatus.NO_CONTENT)
	delete(
		@Request() req: { user: AuthUser },
		@Param("localId") localId: string
	) {
		return this.diaryService.deleteEntry(req.user.id, parseInt(localId, 10))
	}

	@Post("favorites/sync")
	@HttpCode(HttpStatus.NO_CONTENT)
	syncFavorites(
		@Request() req: { user: AuthUser },
		@Body() dto: SyncFavoritesRequest
	) {
		return this.diaryService.syncFavorites(req.user.id, dto)
	}

	@Get("pull")
	pull(
		@Request() req: { user: AuthUser },
		@Query("since") since?: string
	) {
		return this.diaryService.pullEntries(req.user.id, since)
	}
}
