import React, { useMemo, useState } from "react"
import { Alert, Linking, ScrollView, StyleSheet, View } from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import Ionicons from "@expo/vector-icons/Ionicons"
import Purchases from "react-native-purchases"
import { ThemedText } from "@/components/ThemedText"
import { CustomPressable } from "@/components/CustomPressable"
import { PrimaryButton } from "@/components/PrimaryButton"
import { useThemeColor } from "@/hooks/useThemeColor"
import {
	PRIVACY_POLICY_URL,
	SUPPORT_URL,
	TERMS_URL,
} from "@/constants/LegalConfig"
import { BillingPlan, useSubscription } from "@/providers/SubscriptionProvider"
import { useAuth } from "@/providers/AuthProvider"
import { borderRadius } from "@/constants/Theme"
import Animated from "react-native-reanimated"
import {
	getFadeInDownAnimation,
	getFadeOutAnimation,
	getLayoutTransition,
	useMotionEnabled,
} from "@/hooks/useMotion"

const FEATURES = [
	"AI Nutrition Coach — unlimited conversations",
	"Weekly AI Report — personalised insights",
	"AI Food Search — describe meals in plain language",
]

const PRICING_FALLBACK: Record<BillingPlan, string> = {
	Monthly: "$4.99 / month",
	Annual: "$29.99 / year",
}

const getErrorMessage = (error: unknown, fallback: string) => {
	if (typeof error !== "object" || error === null) {
		return fallback
	}

	const message = Reflect.get(error, "message")
	return typeof message === "string" && message.trim().length > 0
		? message
		: fallback
}

const getErrorCode = (error: unknown) =>
	typeof error === "object" && error !== null
		? Reflect.get(error, "code")
		: undefined

export default function PaywallScreen() {
	const theme = useThemeColor()
	const motionEnabled = useMotionEnabled()
	const { isAuthenticated } = useAuth()
	const {
		isSubscriptionReady,
		isSubscriptionConfigured,
		monthlyPackage,
		annualPackage,
		getPackageByPlan,
		purchase,
		restore,
		refresh,
	} = useSubscription()
	const { featureName } = useLocalSearchParams<{ featureName?: string }>()
	const [isStartingTrial, setIsStartingTrial] = useState(false)
	const [isRestoringPurchase, setIsRestoringPurchase] = useState(false)
	const recommendedPlan: BillingPlan = "Annual"
	const [selectedPlan, setSelectedPlan] =
		useState<BillingPlan>(recommendedPlan)

	const pricesByPlan = useMemo(
		() => ({
			Monthly:
				monthlyPackage?.product.priceString ?? PRICING_FALLBACK.Monthly,
			Annual:
				annualPackage?.product.priceString ?? PRICING_FALLBACK.Annual,
		}),
		[monthlyPackage, annualPackage]
	)

	const selectedPlanPackage = getPackageByPlan(selectedPlan)
	const selectedPlanPrice = pricesByPlan[selectedPlan]
	const selectedPlanCta =
		selectedPlan === "Annual"
			? "Start Free Trial — Annual"
			: "Subscribe — Monthly"

	const loginReturnTo =
		featureName && featureName.trim().length > 0
			? `/paywall?featureName=${encodeURIComponent(featureName)}`
			: "/paywall"

	const styles = StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: theme.background,
		},
		inner: {
			flexGrow: 1,
			padding: 24,
			gap: 18,
			paddingTop: 48,
		},
		closeButton: {
			position: "absolute",
			top: 16,
			right: 16,
			zIndex: 10,
			padding: 8,
		},
		heroCard: {
			backgroundColor: theme.surface,
			borderRadius: 16,
			padding: 18,
			gap: 10,
			borderWidth: 1,
			borderColor: theme.onSurface,
			alignItems: "center",
		},
		trialBadge: {
			backgroundColor: theme.primaryAlpha20,
			paddingHorizontal: 12,
			paddingVertical: 6,
			borderRadius: 99,
		},
		featureRow: {
			flexDirection: "row",
			alignItems: "center",
			gap: 12,
			backgroundColor: theme.surface,
			borderRadius: borderRadius,
			paddingHorizontal: 12,
			paddingVertical: 10,
			borderWidth: 1,
			borderColor: theme.onSurface,
		},
		pricingCard: {
			backgroundColor: theme.surface,
			borderRadius,
			padding: 16,
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			borderWidth: 1,
			borderColor: theme.onSurface,
		},
		pricingCardRecommended: {
			borderColor: theme.primaryAlpha33,
		},
		pricingCardSelected: {
			borderWidth: 2,
			borderColor: theme.primary,
			backgroundColor: theme.primaryAlpha20,
		},
		planBadges: {
			alignItems: "flex-end",
			gap: 6,
		},
		badge: {
			borderRadius: 8,
			paddingHorizontal: 8,
			paddingVertical: 2,
		},
		recommendedBadge: {
			backgroundColor: theme.primaryAlpha20,
		},
		selectedBadge: {
			backgroundColor: theme.primary,
		},
		valueText: {
			marginTop: 3,
		},
		ctaSubtext: {
			marginTop: -2,
		},
		restoreButton: {
			alignItems: "center",
			paddingVertical: 8,
		},
		legalLinksRow: {
			flexDirection: "row",
			justifyContent: "center",
			alignItems: "center",
			flexWrap: "wrap",
			gap: 8,
		},
		legalLinkButton: {
			paddingHorizontal: 4,
			paddingVertical: 2,
		},
		legalDivider: {
			opacity: 0.5,
		},
	})

	const openExternalLink = async (
		url: string | undefined,
		label: string
	): Promise<void> => {
		if (!url) {
			Alert.alert(
				"Link Not Configured",
				`${label} URL is not configured for this build yet.`
			)
			return
		}

		try {
			const canOpen = await Linking.canOpenURL(url)
			if (!canOpen) {
				Alert.alert(
					"Unable to Open Link",
					`Could not open ${label} right now.`
				)
				return
			}
			await Linking.openURL(url)
		} catch {
			Alert.alert(
				"Unable to Open Link",
				`Could not open ${label} right now.`
			)
		}
	}

	const navigateToLoginForPurchase = () => {
		Alert.alert(
			"Sign In Required",
			"Create or sign in to an account before purchasing premium."
		)
		router.push({
			pathname: "/(onboarding)/login",
			params: { returnTo: loginReturnTo },
		})
	}

	const handleStartTrial = async () => {
		if (isStartingTrial) return

		if (!isSubscriptionConfigured) {
			Alert.alert(
				"Billing Not Configured",
				"RevenueCat keys are missing for this build."
			)
			return
		}

		if (!isAuthenticated) {
			navigateToLoginForPurchase()
			return
		}

		if (!selectedPlanPackage) {
			await refresh().catch(() => undefined)
			Alert.alert(
				"Plans Unavailable",
				"We could not load subscription plans. Please try again."
			)
			return
		}

		setIsStartingTrial(true)
		try {
			await purchase(selectedPlanPackage)
			router.back()
		} catch (error: unknown) {
			if (
				getErrorCode(error) ===
				Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR
			) {
				return
			}
			Alert.alert(
				"Purchase Failed",
				getErrorMessage(
					error,
					"We couldn't complete your purchase. Please try again."
				)
			)
		} finally {
			setIsStartingTrial(false)
		}
	}

	const handleRestorePurchase = async () => {
		if (isRestoringPurchase) return

		if (!isSubscriptionConfigured) {
			Alert.alert(
				"Billing Not Configured",
				"RevenueCat keys are missing for this build."
			)
			return
		}

		if (!isAuthenticated) {
			navigateToLoginForPurchase()
			return
		}

		setIsRestoringPurchase(true)
		try {
			await restore()
			Alert.alert(
				"Restore Complete",
				"Your available purchases have been restored."
			)
		} catch (error: unknown) {
			Alert.alert(
				"Restore Failed",
				getErrorMessage(error, "Could not restore purchases right now.")
			)
		} finally {
			setIsRestoringPurchase(false)
		}
	}

	return (
		<View style={styles.container}>
			<CustomPressable
				borderRadius={20}
				style={styles.closeButton}
				onPress={() => router.back()}
				hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
				pressScale={0.92}
			>
				<Ionicons name="close" size={24} color={theme.text} />
			</CustomPressable>

			<ScrollView contentContainerStyle={styles.inner}>
				<Animated.View
					entering={getFadeInDownAnimation(motionEnabled, 20, 320)}
					style={styles.heroCard}
				>
					<View style={styles.trialBadge}>
						<ThemedText type="subtitleBold" color={theme.primary}>
							7-day free trial
						</ThemedText>
					</View>
					<ThemedText type="title" centered>
						Start Your Premium Trial
					</ThemedText>
					<ThemedText type="subtitleLight" centered>
						{featureName
							? `Get ${featureName} plus all premium features`
							: "Unlock the full power of your nutrition coach"}
					</ThemedText>
				</Animated.View>

				<View style={{ gap: 12, marginVertical: 8 }}>
					{FEATURES.map((feature, index) => (
						<Animated.View
							key={feature}
							entering={getFadeInDownAnimation(
								motionEnabled,
								100 + index * 45
							)}
							style={styles.featureRow}
						>
							<Ionicons
								name="checkmark-circle"
								size={22}
								color={theme.primary}
							/>
							<ThemedText type="default" style={{ flex: 1 }}>
								{feature}
							</ThemedText>
						</Animated.View>
					))}
				</View>

				<View style={{ gap: 10 }}>
					{(["Monthly", "Annual"] as BillingPlan[]).map(
						(plan, index) => {
							const isRecommended = plan === recommendedPlan
							const isSelected = plan === selectedPlan

							return (
								<Animated.View
									key={plan}
									entering={getFadeInDownAnimation(
										motionEnabled,
										230 + index * 50
									)}
									layout={getLayoutTransition(motionEnabled)}
								>
									<CustomPressable
										borderRadius={borderRadius}
										style={[
											styles.pricingCard,
											isRecommended &&
												styles.pricingCardRecommended,
											isSelected &&
												styles.pricingCardSelected,
										]}
										onPress={() => setSelectedPlan(plan)}
										testID={`plan-${plan.toLowerCase()}`}
										pressScale={0.985}
									>
										<View>
											<ThemedText type="defaultSemiBold">
												{plan}
											</ThemedText>
											<ThemedText
												type="subtitleLight"
												style={styles.valueText}
											>
												{pricesByPlan[plan]}
											</ThemedText>
										</View>

										<View style={styles.planBadges}>
											{isRecommended && (
												<View
													style={[
														styles.badge,
														styles.recommendedBadge,
													]}
												>
													<ThemedText
														type="subtitleLight"
														color={theme.primary}
													>
														Save 50%
													</ThemedText>
												</View>
											)}
											{isSelected && (
												<Animated.View
													entering={getFadeInDownAnimation(
														motionEnabled,
														0,
														180
													)}
													exiting={getFadeOutAnimation(
														motionEnabled
													)}
													style={[
														styles.badge,
														styles.selectedBadge,
													]}
												>
													<ThemedText
														type="subtitleLight"
														color={theme.background}
													>
														Selected
													</ThemedText>
												</Animated.View>
											)}
										</View>
									</CustomPressable>
								</Animated.View>
							)
						}
					)}
				</View>

				<Animated.View
					entering={getFadeInDownAnimation(motionEnabled, 320, 320)}
					layout={getLayoutTransition(motionEnabled)}
				>
					<PrimaryButton
						label={selectedPlanCta}
						onPress={handleStartTrial}
						isLoading={isStartingTrial || !isSubscriptionReady}
						disabled={!isSubscriptionReady}
						pressScale={0.985}
					/>
					<ThemedText
						type="subtitleLight"
						centered
						style={styles.ctaSubtext}
					>
						{selectedPlan === "Annual"
							? `After trial: ${selectedPlanPrice}`
							: `Billed immediately: ${selectedPlanPrice}`}
					</ThemedText>
				</Animated.View>

				<Animated.View
					entering={getFadeInDownAnimation(motionEnabled, 370)}
				>
					<CustomPressable
						borderRadius={borderRadius}
						style={styles.restoreButton}
						onPress={handleRestorePurchase}
						disabled={isRestoringPurchase}
						pressScale={0.99}
					>
						<ThemedText type="subtitleLight" color={theme.primary}>
							{isRestoringPurchase
								? "Restoring…"
								: "Restore Purchase"}
						</ThemedText>
					</CustomPressable>
				</Animated.View>

				<Animated.View
					entering={getFadeInDownAnimation(motionEnabled, 410)}
				>
					<ThemedText
						type="subtitleLight"
						centered
						style={{ opacity: 0.6, fontSize: 11 }}
					>
						Billed securely through Apple App Store or Google Play.
					</ThemedText>
				</Animated.View>

				<Animated.View
					entering={getFadeInDownAnimation(motionEnabled, 450)}
					style={styles.legalLinksRow}
				>
					<CustomPressable
						borderRadius={8}
						style={styles.legalLinkButton}
						onPress={() =>
							void openExternalLink(
								PRIVACY_POLICY_URL,
								"Privacy Policy"
							)
						}
						pressScale={0.98}
					>
						<ThemedText type="subtitleLight" color={theme.primary}>
							Privacy Policy
						</ThemedText>
					</CustomPressable>
					<ThemedText
						type="subtitleLight"
						style={styles.legalDivider}
					>
						•
					</ThemedText>
					<CustomPressable
						borderRadius={8}
						style={styles.legalLinkButton}
						onPress={() =>
							void openExternalLink(TERMS_URL, "Terms of Service")
						}
						pressScale={0.98}
					>
						<ThemedText type="subtitleLight" color={theme.primary}>
							Terms
						</ThemedText>
					</CustomPressable>
					<ThemedText
						type="subtitleLight"
						style={styles.legalDivider}
					>
						•
					</ThemedText>
					<CustomPressable
						borderRadius={8}
						style={styles.legalLinkButton}
						onPress={() =>
							void openExternalLink(SUPPORT_URL, "Support")
						}
						pressScale={0.98}
					>
						<ThemedText type="subtitleLight" color={theme.primary}>
							Support
						</ThemedText>
					</CustomPressable>
				</Animated.View>
			</ScrollView>
		</View>
	)
}
