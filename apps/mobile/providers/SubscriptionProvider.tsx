import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react"
import { Platform } from "react-native"
import Purchases from "react-native-purchases"
import type {
	CustomerInfo,
	PurchasesOffering,
	PurchasesOfferings,
	PurchasesPackage,
} from "@revenuecat/purchases-typescript-internal"
import { useAuth } from "@/providers/AuthProvider"

export type BillingPlan = "Monthly" | "Annual"

interface SubscriptionContextProps {
	isPremium: boolean
	isSubscriptionReady: boolean
	isSubscriptionConfigured: boolean
	hasMissingProducts: boolean
	monthlyPackage: PurchasesPackage | undefined
	annualPackage: PurchasesPackage | undefined
	refresh: () => Promise<void>
	refreshOfferings: () => Promise<void>
	refreshPremiumStatus: () => Promise<void>
	purchase: (aPackage: PurchasesPackage) => Promise<void>
	restore: () => Promise<void>
	getPackageByPlan: (plan: BillingPlan) => PurchasesPackage | undefined
}

const SubscriptionContext = createContext<SubscriptionContextProps | undefined>(
	undefined
)

const FALLBACK_PRICING_IDS = {
	monthly: ["monthly", "month"],
	annual: ["annual", "year"],
}

const OFFERINGS_TIMEOUT_MS = 10_000

const getPlatformApiKey = () => {
	if (Platform.OS === "ios") {
		return process.env.EXPO_PUBLIC_RC_IOS_API_KEY
	}
	if (Platform.OS === "android") {
		return process.env.EXPO_PUBLIC_RC_ANDROID_API_KEY
	}
	return undefined
}

const getEntitlementId = () =>
	process.env.EXPO_PUBLIC_RC_ENTITLEMENT_ID ?? "premium"

const resolvePlanPackage = (
	offering: PurchasesOffering | null,
	plan: BillingPlan
): PurchasesPackage | undefined => {
	if (!offering) return undefined

	if (plan === "Monthly") {
		return (
			offering.monthly ??
			offering.availablePackages.find(
				(pkg) =>
					pkg.packageType === Purchases.PACKAGE_TYPE.MONTHLY ||
					FALLBACK_PRICING_IDS.monthly.some((id) =>
						pkg.identifier.toLowerCase().includes(id)
					)
			)
		)
	}

	return (
		offering.annual ??
		offering.availablePackages.find(
			(pkg) =>
				pkg.packageType === Purchases.PACKAGE_TYPE.ANNUAL ||
				FALLBACK_PRICING_IDS.annual.some((id) =>
					pkg.identifier.toLowerCase().includes(id)
				)
		)
	)
}

/** Races a promise against a timeout. Resolves to null on timeout instead of throwing. */
async function withTimeout<T>(
	promise: Promise<T>,
	ms: number
): Promise<T | null> {
	let timeoutId: ReturnType<typeof setTimeout>
	const timeoutPromise = new Promise<null>((resolve) => {
		timeoutId = setTimeout(() => resolve(null), ms)
	})
	try {
		const result = await Promise.race([promise, timeoutPromise])
		return result
	} finally {
		clearTimeout(timeoutId!)
	}
}

export const SubscriptionProvider: React.FC<React.PropsWithChildren> = ({
	children,
}) => {
	const { user, isAuthLoading } = useAuth()
	const [isPremium, setIsPremium] = useState(false)
	const [isSubscriptionReady, setIsSubscriptionReady] = useState(false)
	const [isSubscriptionConfigured, setIsSubscriptionConfigured] =
		useState(false)
	const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null)
	const listenerRef = useRef<((info: CustomerInfo) => void) | null>(null)
	const linkedUserRef = useRef<string | null | undefined>(undefined)

	const applyCustomerInfo = useCallback((customerInfo: CustomerInfo) => {
		const entitlementId = getEntitlementId()
		setIsPremium(Boolean(customerInfo.entitlements.active[entitlementId]))
	}, [])

	const refreshOfferings = useCallback(async () => {
		if (!isSubscriptionConfigured) return
		try {
			const fetched = await withTimeout(
				Purchases.getOfferings(),
				OFFERINGS_TIMEOUT_MS
			)
			setOfferings(fetched)
		} catch {
			// offerings stay as-is — app remains usable
		}
	}, [isSubscriptionConfigured])

	const refreshPremiumStatus = useCallback(async () => {
		if (!isSubscriptionConfigured) return
		try {
			const customerInfo = await Purchases.getCustomerInfo()
			applyCustomerInfo(customerInfo)
		} catch {
			// best-effort — current isPremium value is retained
		}
	}, [applyCustomerInfo, isSubscriptionConfigured])

	const refresh = useCallback(async () => {
		if (!isSubscriptionConfigured) return

		const [customerInfo, fetchedOfferings] = await Promise.all([
			Purchases.getCustomerInfo(),
			withTimeout(Purchases.getOfferings(), OFFERINGS_TIMEOUT_MS).catch(
				() => null
			),
		])
		applyCustomerInfo(customerInfo)
		setOfferings(fetchedOfferings)
	}, [applyCustomerInfo, isSubscriptionConfigured])

	useEffect(() => {
		let active = true

		const initializePurchases = async () => {
			if (Platform.OS === "web") {
				if (active) {
					setIsSubscriptionConfigured(false)
					setIsSubscriptionReady(true)
				}
				return
			}

			const apiKey = getPlatformApiKey()
			if (!apiKey) {
				console.warn(
					"[SubscriptionProvider] RevenueCat API key missing for platform"
				)
				if (active) {
					setIsSubscriptionConfigured(false)
					setIsSubscriptionReady(true)
				}
				return
			}

			try {
				await Purchases.setLogLevel(Purchases.LOG_LEVEL.WARN)
				const configured = await Purchases.isConfigured()
				if (!configured) {
					Purchases.configure({ apiKey })
				}

				if (!active) return

				setIsSubscriptionConfigured(true)
				const listener = (info: CustomerInfo) => {
					if (!active) return
					applyCustomerInfo(info)
				}
				listenerRef.current = listener
				Purchases.addCustomerInfoUpdateListener(listener)
			} catch (error) {
				console.warn(
					"[SubscriptionProvider] Failed to initialize RevenueCat",
					error
				)
				if (active) {
					setIsSubscriptionConfigured(false)
					setIsSubscriptionReady(true)
				}
			}
		}

		void initializePurchases()

		return () => {
			active = false
			if (listenerRef.current) {
				Purchases.removeCustomerInfoUpdateListener(listenerRef.current)
				listenerRef.current = null
			}
		}
	}, [applyCustomerInfo])

	useEffect(() => {
		if (!isSubscriptionConfigured || isAuthLoading) return
		const desiredUserId = user?.id ?? null
		if (linkedUserRef.current === desiredUserId) return

		setIsSubscriptionReady(false)

		let active = true
		const syncRevenueCatUser = async () => {
			try {
				if (desiredUserId) {
					await Purchases.logIn(desiredUserId)
				} else {
					await Purchases.logOut()
				}
				if (!active) return
				linkedUserRef.current = desiredUserId
				await refresh()
			} catch (error) {
				if (!active) return
				console.warn(
					"[SubscriptionProvider] Failed to sync RevenueCat user",
					error
				)
			} finally {
				if (active) {
					setIsSubscriptionReady(true)
				}
			}
		}

		void syncRevenueCatUser()

		return () => {
			active = false
		}
	}, [isSubscriptionConfigured, isAuthLoading, user?.id, refresh])

	const currentOffering = offerings?.current ?? null

	const monthlyPackage = useMemo(
		() => resolvePlanPackage(currentOffering, "Monthly"),
		[currentOffering]
	)

	const annualPackage = useMemo(
		() => resolvePlanPackage(currentOffering, "Annual"),
		[currentOffering]
	)

	// True when RC is configured and ready but neither package resolved —
	// indicates the RevenueCat dashboard has no products configured yet.
	const hasMissingProducts = useMemo(
		() =>
			isSubscriptionConfigured &&
			isSubscriptionReady &&
			offerings !== null &&
			!monthlyPackage &&
			!annualPackage,
		[
			isSubscriptionConfigured,
			isSubscriptionReady,
			offerings,
			monthlyPackage,
			annualPackage,
		]
	)

	const getPackageByPlan = useCallback(
		(plan: BillingPlan) =>
			plan === "Monthly" ? monthlyPackage : annualPackage,
		[annualPackage, monthlyPackage]
	)

	const purchase = useCallback(
		async (aPackage: PurchasesPackage) => {
			const result = await Purchases.purchasePackage(aPackage)
			applyCustomerInfo(result.customerInfo)
		},
		[applyCustomerInfo]
	)

	const restore = useCallback(async () => {
		const customerInfo = await Purchases.restorePurchases()
		applyCustomerInfo(customerInfo)
	}, [applyCustomerInfo])

	const contextValue = useMemo(
		() => ({
			isPremium,
			isSubscriptionReady,
			isSubscriptionConfigured,
			hasMissingProducts,
			monthlyPackage,
			annualPackage,
			refresh,
			refreshOfferings,
			refreshPremiumStatus,
			purchase,
			restore,
			getPackageByPlan,
		}),
		[
			isPremium,
			isSubscriptionReady,
			isSubscriptionConfigured,
			hasMissingProducts,
			monthlyPackage,
			annualPackage,
			refresh,
			refreshOfferings,
			refreshPremiumStatus,
			purchase,
			restore,
			getPackageByPlan,
		]
	)

	return (
		<SubscriptionContext.Provider value={contextValue}>
			{children}
		</SubscriptionContext.Provider>
	)
}

export const useSubscription = (): SubscriptionContextProps => {
	const context = useContext(SubscriptionContext)
	if (!context) {
		throw new Error(
			"useSubscription must be used within a SubscriptionProvider"
		)
	}
	return context
}
