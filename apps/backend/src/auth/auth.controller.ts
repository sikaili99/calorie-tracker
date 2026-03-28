import {
	Controller,
	Post,
	Body,
	HttpCode,
	HttpStatus,
} from "@nestjs/common"
import { AuthService } from "./auth.service"
import type {
	RegisterRequest,
	LoginRequest,
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
	login(@Body() dto: LoginRequest) {
		return this.authService.login(dto)
	}
}
