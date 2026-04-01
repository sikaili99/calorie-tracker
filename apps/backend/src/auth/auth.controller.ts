import {
	Controller,
	Post,
	Get,
	Body,
	HttpCode,
	HttpStatus,
	UseGuards,
	Request,
} from "@nestjs/common"
import { AuthService } from "./auth.service"
import { LocalAuthGuard } from "./guards/local-auth.guard"
import { JwtAuthGuard } from "./guards/jwt-auth.guard"
import {
	validateGoogleAuthRequest,
	validateLogoutRequest,
	validateRefreshRequest,
	validateRegisterRequest,
} from "./auth.validation"
import type { AuthUser, JwtRequestUser } from "@calorie-tracker/shared-types"

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post("register")
	@HttpCode(HttpStatus.CREATED)
	register(@Body() body: unknown) {
		const dto = validateRegisterRequest(body)
		return this.authService.register(dto)
	}

	@Post("login")
	@HttpCode(HttpStatus.OK)
	@UseGuards(LocalAuthGuard)
	login(@Request() req: { user: AuthUser }) {
		return this.authService.login(req.user)
	}

	@Post("google")
	@HttpCode(HttpStatus.OK)
	googleAuth(@Body() body: unknown) {
		const dto = validateGoogleAuthRequest(body)
		return this.authService.googleAuth(dto.idToken)
	}

	@Post("refresh")
	@HttpCode(HttpStatus.OK)
	refresh(@Body() body: unknown) {
		const dto = validateRefreshRequest(body)
		return this.authService.refresh(dto.refreshToken)
	}

	@Post("logout")
	@HttpCode(HttpStatus.NO_CONTENT)
	logout(@Body() body: unknown) {
		const dto = validateLogoutRequest(body)
		return this.authService.logout(dto.refreshToken)
	}

	@Get("me")
	@UseGuards(JwtAuthGuard)
	me(@Request() req: { user: JwtRequestUser }) {
		return this.authService.getMe(req.user.id)
	}
}
