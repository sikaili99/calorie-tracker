import {
	CanActivate,
	ExecutionContext,
	HttpException,
	HttpStatus,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common"
import { RevenueCatService } from "./revenuecat.service"

@Injectable()
export class PremiumGuard implements CanActivate {
	constructor(private readonly revenueCatService: RevenueCatService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<{
			user?: { id?: string }
		}>()
		const userId = request.user?.id
		if (!userId) {
			throw new UnauthorizedException("Unauthorized")
		}

		const premiumStatus =
			await this.revenueCatService.getPremiumStatus(userId)
		if (premiumStatus === "active") {
			return true
		}

		if (premiumStatus === "inactive") {
			throw new HttpException(
				{
					statusCode: HttpStatus.PAYMENT_REQUIRED,
					error: "Payment Required",
					code: "PREMIUM_REQUIRED",
					message: "Premium subscription required",
				},
				HttpStatus.PAYMENT_REQUIRED
			)
		}

		throw new HttpException(
			{
				statusCode: HttpStatus.SERVICE_UNAVAILABLE,
				error: "Service Unavailable",
				code: "SUBSCRIPTION_STATUS_UNAVAILABLE",
				message: "Subscription status unavailable",
			},
			HttpStatus.SERVICE_UNAVAILABLE
		)
	}
}
