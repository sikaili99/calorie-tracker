import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"
import type { JwtPayload, JwtRequestUser } from "@calorie-tracker/shared-types"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(configService: ConfigService) {
		const jwtSecret = configService.get<string>("JWT_SECRET")
		if (!jwtSecret) {
			throw new Error("JWT_SECRET is required")
		}

		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: jwtSecret,
		})
	}

	validate(payload: JwtPayload): JwtRequestUser {
		return { id: payload.sub, email: payload.email }
	}
}
