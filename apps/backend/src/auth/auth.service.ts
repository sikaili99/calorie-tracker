import {
	ConflictException,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { JwtService } from "@nestjs/jwt"
import * as bcrypt from "bcrypt"
import { randomUUID } from "crypto"
import { OAuth2Client } from "google-auth-library"
import { PrismaService } from "../prisma/prisma.service"
import type {
	AuthResponse,
	AuthUser,
	RegisterRequest,
} from "@calorie-tracker/shared-types"

@Injectable()
export class AuthService {
	private googleClient: OAuth2Client

	constructor(
		private prisma: PrismaService,
		private jwtService: JwtService,
		private configService: ConfigService
	) {
		const googleClientId = this.configService.get<string>("GOOGLE_CLIENT_ID")
		this.googleClient = new OAuth2Client(googleClientId)
	}

	async validateUser(email: string, password: string): Promise<AuthUser | null> {
		const user = await this.prisma.user.findUnique({ where: { email } })
		if (!user || !user.password) return null
		const valid = await bcrypt.compare(password, user.password)
		if (!valid) return null
		return {
			id: user.id,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
		}
	}

	async register(dto: RegisterRequest): Promise<AuthResponse> {
		const existing = await this.prisma.user.findUnique({
			where: { email: dto.email },
		})
		if (existing) {
			throw new ConflictException("Email already in use")
		}
		const hash = await bcrypt.hash(dto.password, 12)
		const user = await this.prisma.user.create({
			data: {
				firstName: dto.firstName,
				lastName: dto.lastName,
				email: dto.email,
				password: hash,
			},
		})
		return this.generateTokens({
			id: user.id,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
		})
	}

	async login(user: AuthUser): Promise<AuthResponse> {
		return this.generateTokens(user)
	}

	async googleAuth(idToken: string): Promise<AuthResponse> {
		const googleClientId = this.configService.get<string>("GOOGLE_CLIENT_ID")
		const ticket = await this.googleClient.verifyIdToken({
			idToken,
			audience: googleClientId,
		})
		const payload = ticket.getPayload()
		if (!payload?.sub || !payload.email) {
			throw new UnauthorizedException("Invalid Google token")
		}

		const { sub: googleId, email, given_name, family_name } = payload
		const firstName = given_name ?? email.split("@")[0]
		const lastName = family_name ?? ""

		const user = await this.prisma.user.upsert({
			where: { googleId },
			create: { googleId, email, firstName, lastName },
			update: {},
		})

		return this.generateTokens({
			id: user.id,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
		})
	}

	async refresh(token: string): Promise<AuthResponse> {
		const stored = await this.prisma.refreshToken.findUnique({
			where: { token },
			include: { user: true },
		})
		if (!stored || stored.expiresAt < new Date()) {
			throw new UnauthorizedException("Invalid or expired refresh token")
		}
		await this.prisma.refreshToken.delete({ where: { id: stored.id } })
		return this.generateTokens({
			id: stored.user.id,
			firstName: stored.user.firstName,
			lastName: stored.user.lastName,
			email: stored.user.email,
		})
	}

	async logout(token: string): Promise<void> {
		await this.prisma.refreshToken.deleteMany({ where: { token } })
	}

	private async generateTokens(user: AuthUser): Promise<AuthResponse> {
		const accessToken = this.jwtService.sign(
			{ sub: user.id, email: user.email },
			{ expiresIn: "15m" }
		)
		const refreshToken = randomUUID()
		const expiresAt = new Date()
		expiresAt.setDate(expiresAt.getDate() + 7)
		await this.prisma.refreshToken.create({
			data: { token: refreshToken, userId: user.id, expiresAt },
		})
		return { accessToken, refreshToken, user }
	}
}
