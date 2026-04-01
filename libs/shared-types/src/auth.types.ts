export interface RegisterRequest {
	firstName: string
	lastName: string
	email: string
	password: string
}

export interface LoginRequest {
	email: string
	password: string
}

export interface GoogleAuthRequest {
	idToken: string
}

export interface RefreshRequest {
	refreshToken: string
}

export interface LogoutRequest {
	refreshToken: string
}

export interface AuthUser {
	id: string
	firstName: string
	lastName: string
	email: string
}

export interface AuthResponse {
	accessToken: string
	refreshToken: string
	user: AuthUser
}

export interface JwtRequestUser {
	id: string
	email: string
}

export interface JwtPayload {
	sub: string
	email: string
	iat: number
	exp: number
}
