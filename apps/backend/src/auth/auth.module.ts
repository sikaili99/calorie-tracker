import { Module } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { JwtModule } from "@nestjs/jwt"
import { PassportModule } from "@nestjs/passport"
import { AuthController } from "./auth.controller"
import { AuthService } from "./auth.service"
import { LocalStrategy } from "./strategies/local.strategy"
import { JwtStrategy } from "./strategies/jwt.strategy"
import { JwtAuthGuard } from "./guards/jwt-auth.guard"

@Module({
	imports: [
		PassportModule,
		JwtModule.registerAsync({
			useFactory: (config: ConfigService) => {
				const jwtSecret = config.get<string>("JWT_SECRET")
				if (!jwtSecret) {
					throw new Error("JWT_SECRET is required")
				}

				return {
					secret: jwtSecret,
					signOptions: { expiresIn: "15m" },
				}
			},
			inject: [ConfigService],
		}),
	],
	controllers: [AuthController],
	providers: [AuthService, LocalStrategy, JwtStrategy, JwtAuthGuard],
	exports: [JwtAuthGuard, JwtModule],
})
export class AuthModule {}
