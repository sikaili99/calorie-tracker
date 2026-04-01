import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { Strategy } from "passport-local"
import { AuthService } from "../auth.service"
import { isValidEmail } from "../auth.validation"

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
	constructor(private authService: AuthService) {
		super({ usernameField: "email" })
	}

	async validate(email: string, password: string) {
		if (typeof email !== "string" || !email.trim()) {
			throw new BadRequestException("email is required")
		}
		if (typeof password !== "string" || !password.trim()) {
			throw new BadRequestException("password is required")
		}

		const normalizedEmail = email.trim().toLowerCase()
		if (!isValidEmail(normalizedEmail)) {
			throw new BadRequestException("email must be a valid email address")
		}

		const user = await this.authService.validateUser(
			normalizedEmail,
			password
		)
		if (!user) {
			throw new UnauthorizedException("Invalid credentials")
		}
		return user
	}
}
