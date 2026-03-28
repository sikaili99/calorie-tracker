export interface RegisterRequest {
	name: string
	email: string
	password: string
}

export interface LoginRequest {
	email: string
	password: string
}

export interface AuthResponse {
	accessToken: string
}

export interface JwtPayload {
	sub: string
	email: string
	iat: number
	exp: number
}
