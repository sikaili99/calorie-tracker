import { BadRequestException } from "@nestjs/common"
import type {
	GoogleAuthRequest,
	LogoutRequest,
	RefreshRequest,
	RegisterRequest,
} from "@calorie-tracker/shared-types"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function asObject(value: unknown): Record<string, unknown> {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		throw new BadRequestException("Request body must be a JSON object")
	}
	return value as Record<string, unknown>
}

function requireTrimmedString(
	body: Record<string, unknown>,
	field: string
): string {
	const value = body[field]
	if (typeof value !== "string") {
		throw new BadRequestException(`${field} must be a string`)
	}
	const trimmed = value.trim()
	if (!trimmed) {
		throw new BadRequestException(`${field} is required`)
	}
	return trimmed
}

export function isValidEmail(email: string): boolean {
	return EMAIL_REGEX.test(email)
}

export function validateRegisterRequest(body: unknown): RegisterRequest {
	const obj = asObject(body)
	const firstName = requireTrimmedString(obj, "firstName")
	const lastName = requireTrimmedString(obj, "lastName")
	const email = requireTrimmedString(obj, "email").toLowerCase()
	const password = requireTrimmedString(obj, "password")

	if (!isValidEmail(email)) {
		throw new BadRequestException("email must be a valid email address")
	}
	if (password.length < 6) {
		throw new BadRequestException("password must be at least 6 characters")
	}

	return { firstName, lastName, email, password }
}

export function validateGoogleAuthRequest(body: unknown): GoogleAuthRequest {
	const obj = asObject(body)
	return { idToken: requireTrimmedString(obj, "idToken") }
}

export function validateRefreshRequest(body: unknown): RefreshRequest {
	const obj = asObject(body)
	return { refreshToken: requireTrimmedString(obj, "refreshToken") }
}

export function validateLogoutRequest(body: unknown): LogoutRequest {
	const obj = asObject(body)
	return { refreshToken: requireTrimmedString(obj, "refreshToken") }
}
