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
import type {
	RegisterRequest,
	GoogleAuthRequest,
	RefreshRequest,
	LogoutRequest,
	AuthUser,
} from "@calorie-tracker/shared-types"

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post("register")
	@HttpCode(HttpStatus.CREATED)
	register(@Body() dto: RegisterRequest) {
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
	googleAuth(@Body() dto: GoogleAuthRequest) {
		return this.authService.googleAuth(dto.idToken)
	}

	@Post("refresh")
	@HttpCode(HttpStatus.OK)
	refresh(@Body() dto: RefreshRequest) {
		return this.authService.refresh(dto.refreshToken)
	}

	@Post("logout")
	@HttpCode(HttpStatus.NO_CONTENT)
	logout(@Body() dto: LogoutRequest) {
		return this.authService.logout(dto.refreshToken)
	}

	@Get("me")
	@UseGuards(JwtAuthGuard)
	me(@Request() req: { user: AuthUser }) {
		return req.user
	}
}
