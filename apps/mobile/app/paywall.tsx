import React, { useState } from "react"
import { View, StyleSheet, ScrollView } from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import { useThemeColor } from "@/hooks/useThemeColor"
import { ThemedText } from "@/components/ThemedText"
import { CustomPressable } from "@/components/CustomPressable"
import { PrimaryButton } from "@/components/PrimaryButton"
import { useSettings } from "@/providers/SettingsProvider"
import Ionicons from "@expo/vector-icons/Ionicons"
import { borderRadius } from "@/constants/Theme"

const FEATURES = [
	"AI Nutrition Coach — unlimited conversations",
	"Weekly AI Report — personalised insights",
	"AI Food Search — describe meals in plain language",
]

const PRICING = [
	{ label: "Monthly", price: "$4.99 / month", badge: null },
	{ label: "Annual", price: "$29.99 / year", badge: "Save 50%" },
]

export default function PaywallScreen() {
	const theme = useThemeColor()
	const { updateIsPremium } = useSettings()
	const { featureName } = useLocalSearchParams<{ featureName?: string }>()
	const [isStartingTrial, setIsStartingTrial] = useState(false)

	const styles = StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: theme.background,
		},
		inner: {
			flexGrow: 1,
			padding: 24,
			gap: 16,
			paddingTop: 48,
		},
		closeButton: {
			position: "absolute",
			top: 16,
			right: 16,
			zIndex: 10,
			padding: 8,
		},
		featureRow: {
			flexDirection: "row",
			alignItems: "center",
			gap: 12,
		},
		pricingCard: {
			backgroundColor: theme.surface,
			borderRadius,
			padding: 16,
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
		},
		badge: {
			backgroundColor: theme.primaryAlpha20,
			borderRadius: 8,
			paddingHorizontal: 8,
			paddingVertical: 2,
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
			await updateIsPremium(true)
			router.back()
		} finally {
			setIsStartingTrial(false)
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
				<ThemedText type="title" centered>
					Go Premium
				</ThemedText>
				<ThemedText type="subtitleLight" centered>
					{featureName
						? `Unlock ${featureName} and other premium features`
						: "Unlock the full power of your nutrition coach"}
				</ThemedText>

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
					{PRICING.map((plan) => (
						<View key={plan.label} style={styles.pricingCard}>
							<View>
								<ThemedText type="defaultSemiBold">
									{plan.label}
								</ThemedText>
								<ThemedText type="subtitleLight">
									{plan.price}
								</ThemedText>
							</View>
							{plan.badge && (
								<View style={styles.badge}>
									<ThemedText
										type="subtitleLight"
										color={theme.primary}
									>
										{plan.badge}
									</ThemedText>
								</View>
							)}
						</View>
					))}
				</View>

				<PrimaryButton
					label="Start Free Trial"
					onPress={handleStartTrial}
					isLoading={isStartingTrial}
				/>

				<CustomPressable
					borderRadius={borderRadius}
					style={styles.restoreButton}
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
					Cancel anytime. Billed via App Store.
				</ThemedText>
			</ScrollView>
		</View>
	)
}
