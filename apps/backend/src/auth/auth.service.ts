import { Injectable } from "@nestjs/common"
import type {
	RegisterRequest,
	LoginRequest,
} from "@calorie-tracker/shared-types"

@Injectable()
export class AuthService {
	async register(_dto: RegisterRequest): Promise<void> {
		// STUB: Prisma user creation + password hashing goes here
	}

	async login(_dto: LoginRequest): Promise<void> {
		// STUB: JWT generation + validation goes here
	}
}
