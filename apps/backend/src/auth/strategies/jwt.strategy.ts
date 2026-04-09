import { Injectable, UnauthorizedException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"
import type { JwtPayload, JwtRequestUser } from "@calorie-tracker/shared-types"
import { PrismaService } from "../../prisma/prisma.service"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		configService: ConfigService,
		private readonly prisma: PrismaService
	) {
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

	async validate(payload: JwtPayload): Promise<JwtRequestUser> {
		const user = await this.prisma.user.findFirst({
			where: { id: payload.sub, deletedAt: null },
			select: { id: true },
		})
		if (!user) {
			throw new UnauthorizedException("Invalid token")
		}

		return { id: payload.sub, email: payload.email }
	}
}
