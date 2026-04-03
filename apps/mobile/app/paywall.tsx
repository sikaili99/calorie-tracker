import React, { useMemo, useState } from "react"
import { Alert, ScrollView, StyleSheet, View } from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import Ionicons from "@expo/vector-icons/Ionicons"
import Purchases from "react-native-purchases"
import { ThemedText } from "@/components/ThemedText"
import { CustomPressable } from "@/components/CustomPressable"
import { PrimaryButton } from "@/components/PrimaryButton"
import { useThemeColor } from "@/hooks/useThemeColor"
import {
	BillingPlan,
	useSubscription,
} from "@/providers/SubscriptionProvider"
import { useAuth } from "@/providers/AuthProvider"
import { borderRadius } from "@/constants/Theme"

const FEATURES = [
	"AI Nutrition Coach — unlimited conversations",
	"Weekly AI Report — personalised insights",
	"AI Food Search — describe meals in plain language",
]

const PRICING_FALLBACK: Record<BillingPlan, string> = {
	Monthly: "$4.99 / month",
	Annual: "$29.99 / year",
}

export default function PaywallScreen() {
	const theme = useThemeColor()
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
			Monthly: monthlyPackage?.product.priceString ?? PRICING_FALLBACK.Monthly,
			Annual: annualPackage?.product.priceString ?? PRICING_FALLBACK.Annual,
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
	})

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
		} catch (error: any) {
			if (
				error?.code ===
				Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR
			) {
				return
			}
			Alert.alert(
				"Purchase Failed",
				error?.message ??
					"We couldn't complete your purchase. Please try again."
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
		} catch (error: any) {
			Alert.alert(
				"Restore Failed",
				error?.message ?? "Could not restore purchases right now."
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
			>
				<Ionicons name="close" size={24} color={theme.text} />
			</CustomPressable>

			<ScrollView contentContainerStyle={styles.inner}>
				<View style={styles.heroCard}>
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
				</View>

				<View style={{ gap: 12, marginVertical: 8 }}>
					{FEATURES.map((feature) => (
						<View key={feature} style={styles.featureRow}>
							<Ionicons
								name="checkmark-circle"
								size={22}
								color={theme.primary}
							/>
							<ThemedText type="default" style={{ flex: 1 }}>
								{feature}
							</ThemedText>
						</View>
					))}
				</View>

				<View style={{ gap: 10 }}>
					{(["Monthly", "Annual"] as BillingPlan[]).map((plan) => {
						const isRecommended = plan === recommendedPlan
						const isSelected = plan === selectedPlan

						return (
							<CustomPressable
								key={plan}
								borderRadius={borderRadius}
								style={[
									styles.pricingCard,
									isRecommended &&
										styles.pricingCardRecommended,
									isSelected && styles.pricingCardSelected,
								]}
								onPress={() => setSelectedPlan(plan)}
								testID={`plan-${plan.toLowerCase()}`}
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
										<View
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
										</View>
									)}
								</View>
							</CustomPressable>
						)
					})}
				</View>

				<PrimaryButton
					label={selectedPlanCta}
					onPress={handleStartTrial}
					isLoading={isStartingTrial || !isSubscriptionReady}
					disabled={!isSubscriptionReady}
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

				<CustomPressable
					borderRadius={borderRadius}
					style={styles.restoreButton}
					onPress={handleRestorePurchase}
					disabled={isRestoringPurchase}
				>
					<ThemedText type="subtitleLight" color={theme.primary}>
						{isRestoringPurchase
							? "Restoring…"
							: "Restore Purchase"}
					</ThemedText>
				</CustomPressable>

				<ThemedText
					type="subtitleLight"
					centered
					style={{ opacity: 0.6, fontSize: 11 }}
				>
					Billed securely through Apple App Store or Google Play.
				</ThemedText>
			</ScrollView>
		</View>
	)
}
