import {
	ConflictException,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common"
import { Prisma, type User } from "@prisma/client"
import { ConfigService } from "@nestjs/config"
import { JwtService } from "@nestjs/jwt"
import * as bcrypt from "bcrypt"
import { randomUUID } from "crypto"
import { OAuth2Client, type LoginTicket } from "google-auth-library"
import { PrismaService } from "../prisma/prisma.service"
import type {
	AuthResponse,
	AuthUser,
	RegisterRequest,
} from "@calorie-tracker/shared-types"

@Injectable()
export class AuthService {
	private googleClient: OAuth2Client
	private googleClientId: string

	constructor(
		private prisma: PrismaService,
		private jwtService: JwtService,
		private configService: ConfigService
	) {
		const googleClientId =
			this.configService.get<string>("GOOGLE_CLIENT_ID")
		if (!googleClientId) {
			throw new Error("GOOGLE_CLIENT_ID is required")
		}
		this.googleClientId = googleClientId
		this.googleClient = new OAuth2Client(googleClientId)
	}

	async validateUser(
		email: string,
		password: string
	): Promise<AuthUser | null> {
		const normalizedEmail = email.trim().toLowerCase()
		const user = await this.prisma.user.findUnique({
			where: { email: normalizedEmail },
		})
		if (!user || !user.password) return null
		const valid = await bcrypt.compare(password, user.password)
		if (!valid) return null
		return this.toAuthUser(user)
	}

	async register(dto: RegisterRequest): Promise<AuthResponse> {
		const normalizedEmail = dto.email.trim().toLowerCase()
		const existing = await this.prisma.user.findUnique({
			where: { email: normalizedEmail },
		})
		if (existing) {
			throw new ConflictException("Email already in use")
		}
		const hash = await bcrypt.hash(dto.password, 12)
		try {
			const user = await this.prisma.user.create({
				data: {
					firstName: dto.firstName,
					lastName: dto.lastName,
					email: normalizedEmail,
					password: hash,
				},
			})
			return this.generateTokens(this.toAuthUser(user))
		} catch (error: unknown) {
			this.throwIfUniqueConstraint(error, "Email already in use")
			throw error
		}
	}

	async login(user: AuthUser): Promise<AuthResponse> {
		return this.generateTokens(user)
	}

	async googleAuth(idToken: string): Promise<AuthResponse> {
		let ticket: LoginTicket
		try {
			ticket = await this.googleClient.verifyIdToken({
				idToken,
				audience: this.googleClientId,
			})
		} catch {
			throw new UnauthorizedException("Invalid Google token")
		}

		const payload = ticket.getPayload()
		if (!payload?.sub || !payload.email) {
			throw new UnauthorizedException("Invalid Google token")
		}

		const { sub: googleId, given_name, family_name } = payload
		const email = payload.email.toLowerCase()
		const firstName = given_name ?? email.split("@")[0]
		const lastName = family_name ?? ""

		try {
			const userByGoogleId = await this.prisma.user.findUnique({
				where: { googleId },
			})

			if (userByGoogleId) {
				let resolvedUser = userByGoogleId
				if (
					userByGoogleId.email !== email ||
					userByGoogleId.firstName !== firstName ||
					userByGoogleId.lastName !== lastName
				) {
					const emailOwner = await this.prisma.user.findUnique({
						where: { email },
					})
					if (emailOwner && emailOwner.id !== userByGoogleId.id) {
						throw new ConflictException(
							"Google account email is already in use by another account"
						)
					}
					resolvedUser = await this.prisma.user.update({
						where: { id: userByGoogleId.id },
						data: {
							email,
							firstName,
							lastName,
						},
					})
				}
				return this.generateTokens(this.toAuthUser(resolvedUser))
			}

			const userByEmail = await this.prisma.user.findUnique({
				where: { email },
			})
			if (userByEmail) {
				if (userByEmail.googleId && userByEmail.googleId !== googleId) {
					throw new ConflictException(
						"Email is already linked to another Google account"
					)
				}
				const linkedUser = await this.prisma.user.update({
					where: { id: userByEmail.id },
					data: {
						googleId,
					},
				})
				return this.generateTokens(this.toAuthUser(linkedUser))
			}

			const createdUser = await this.prisma.user.create({
				data: {
					googleId,
					email,
					firstName,
					lastName,
				},
			})
			return this.generateTokens(this.toAuthUser(createdUser))
		} catch (error: unknown) {
			this.throwIfUniqueConstraint(
				error,
				"Google account could not be linked due to a conflicting account"
			)
			throw error
		}
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
		return this.generateTokens(this.toAuthUser(stored.user))
	}

	async logout(token: string): Promise<void> {
		await this.prisma.refreshToken.deleteMany({ where: { token } })
	}

	async getMe(userId: string): Promise<AuthUser> {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
		})
		if (!user) {
			throw new UnauthorizedException("User not found")
		}
		return this.toAuthUser(user)
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

	private toAuthUser(user: User): AuthUser {
		return {
			id: user.id,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
		}
	}

	private throwIfUniqueConstraint(error: unknown, message: string): void {
		if (
			error instanceof Prisma.PrismaClientKnownRequestError &&
			error.code === "P2002"
		) {
			throw new ConflictException(message)
		}
	}
}
