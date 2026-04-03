import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"

export type PremiumStatus = "active" | "inactive" | "unavailable"

type RevenueCatEntitlement = {
	expires_date?: string | null
}

type RevenueCatSubscriberResponse = {
	subscriber?: {
		entitlements?: Record<string, RevenueCatEntitlement>
	}
}

type CacheEntry = {
	isPremium: boolean
	checkedAt: number
	lastActiveAt: number | null
}

const CACHE_TTL_MS = 60_000
const FALLBACK_ACTIVE_WINDOW_MS = 15 * 60_000

@Injectable()
export class RevenueCatService {
	private readonly secretApiKey: string
	private readonly entitlementId: string
	private readonly cache = new Map<string, CacheEntry>()

	constructor(private readonly configService: ConfigService) {
		const secretApiKey = this.configService.get<string>(
			"REVENUECAT_SECRET_API_KEY"
		)
		if (!secretApiKey) {
			throw new Error("REVENUECAT_SECRET_API_KEY is required")
		}
		this.secretApiKey = secretApiKey
		this.entitlementId =
			this.configService.get<string>("REVENUECAT_ENTITLEMENT_ID") ??
			"premium"
	}

	async getPremiumStatus(userId: string): Promise<PremiumStatus> {
		const now = Date.now()
		const cached = this.cache.get(userId)

		if (cached && now - cached.checkedAt <= CACHE_TTL_MS) {
			return cached.isPremium ? "active" : "inactive"
		}

		try {
			const isPremium = await this.fetchPremiumEntitlement(userId)
			this.cache.set(userId, {
				isPremium,
				checkedAt: now,
				lastActiveAt: isPremium ? now : cached?.lastActiveAt ?? null,
			})
			return isPremium ? "active" : "inactive"
		} catch (error) {
			if (
				cached?.isPremium &&
				cached.lastActiveAt &&
				now - cached.lastActiveAt <= FALLBACK_ACTIVE_WINDOW_MS
			) {
				return "active"
			}
			console.warn(
				"[RevenueCatService] Subscription lookup failed",
				error
			)
			return "unavailable"
		}
	}

	private async fetchPremiumEntitlement(userId: string): Promise<boolean> {
		const response = await fetch(
			`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(
				userId
			)}`,
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${this.secretApiKey}`,
					"Content-Type": "application/json",
				},
			}
		)

		if (!response.ok) {
			throw new Error(
				`RevenueCat request failed with status ${response.status}`
			)
		}

		const payload = (await response.json()) as RevenueCatSubscriberResponse
		const entitlement = payload.subscriber?.entitlements?.[
			this.entitlementId
		]
		if (!entitlement) return false

		const expiresAt = entitlement.expires_date
		if (!expiresAt) return true
		const expiresAtMs = new Date(expiresAt).getTime()
		if (!Number.isFinite(expiresAtMs)) return false
		return expiresAtMs > Date.now()
	}
}
