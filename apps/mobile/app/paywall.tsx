import React, { useState } from "react"
import { Alert, ScrollView, StyleSheet, View } from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import Ionicons from "@expo/vector-icons/Ionicons"
import { ThemedText } from "@/components/ThemedText"
import { CustomPressable } from "@/components/CustomPressable"
import { PrimaryButton } from "@/components/PrimaryButton"
import { useThemeColor } from "@/hooks/useThemeColor"
import { useSettings } from "@/providers/SettingsProvider"
import { borderRadius } from "@/constants/Theme"

const FEATURES = [
	"AI Nutrition Coach — unlimited conversations",
	"Weekly AI Report — personalised insights",
	"AI Food Search — describe meals in plain language",
]

const PRICING = [
	{ label: "Monthly", price: "$4.99 / month" },
	{ label: "Annual", price: "$29.99 / year", badge: "Save 50%" },
] as const

type PlanLabel = (typeof PRICING)[number]["label"]

export default function PaywallScreen() {
	const theme = useThemeColor()
	const { updateIsPremium } = useSettings()
	const { featureName } = useLocalSearchParams<{ featureName?: string }>()
	const [isStartingTrial, setIsStartingTrial] = useState(false)
	const recommendedPlan: PlanLabel = "Annual"
	const [selectedPlan, setSelectedPlan] = useState<PlanLabel>(recommendedPlan)

	const selectedPlanDetails = PRICING.find(
		(plan) => plan.label === selectedPlan
	)!

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

	const handleStartTrial = async () => {
		if (isStartingTrial) return
		setIsStartingTrial(true)
		try {
			// Local unlock scope for now (no store billing integration in this pass).
			await updateIsPremium(true)
			router.back()
		} finally {
			setIsStartingTrial(false)
		}
	}

	const handleRestorePurchase = () => {
		Alert.alert(
			"Restore Coming Soon",
			"Restore purchase will be available once store billing is integrated."
		)
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
					{PRICING.map((plan) => {
						const isRecommended = plan.label === recommendedPlan
						const isSelected = plan.label === selectedPlan

						return (
							<CustomPressable
								key={plan.label}
								borderRadius={borderRadius}
								style={[
									styles.pricingCard,
									isRecommended &&
										styles.pricingCardRecommended,
									isSelected && styles.pricingCardSelected,
								]}
								onPress={() => setSelectedPlan(plan.label)}
								testID={`plan-${plan.label.toLowerCase()}`}
							>
								<View>
									<ThemedText type="defaultSemiBold">
										{plan.label}
									</ThemedText>
									<ThemedText
										type="subtitleLight"
										style={styles.valueText}
									>
										{plan.price}
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
												{plan.badge ?? "Best Value"}
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
					label={`Start Free Trial — ${selectedPlan}`}
					onPress={handleStartTrial}
					isLoading={isStartingTrial}
				/>
				<ThemedText
					type="subtitleLight"
					centered
					style={styles.ctaSubtext}
				>
					Selected plan after trial: {selectedPlanDetails.price}
				</ThemedText>

				<CustomPressable
					borderRadius={borderRadius}
					style={styles.restoreButton}
					onPress={handleRestorePurchase}
				>
					<ThemedText type="subtitleLight" color={theme.primary}>
						Restore Purchase
					</ThemedText>
				</CustomPressable>

				<ThemedText
					type="subtitleLight"
					centered
					style={{ opacity: 0.6, fontSize: 11 }}
				>
					Local trial mode. Store billing integration is coming soon.
				</ThemedText>
			</ScrollView>
		</View>
	)
}
