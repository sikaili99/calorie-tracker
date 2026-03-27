import React, { useMemo } from "react"
import { View, StyleSheet, TouchableOpacity } from "react-native"
import { ThemedText } from "@/components/ThemedText"
import { useThemeColor } from "@/hooks/useThemeColor"
import { borderRadius } from "@/constants/Theme"
import { useTargetSuggestions } from "@/hooks/useTargetSuggestions"
import { useSettings } from "@/providers/SettingsProvider"
import { Ionicons } from "@expo/vector-icons"

export const TargetSuggestionBanner = () => {
	const theme = useThemeColor()
	const { suggestion, dismiss } = useTargetSuggestions()
	const { updateTargetCalories } = useSettings()

	const styles = useMemo(
		() =>
			StyleSheet.create({
				banner: {
					backgroundColor: theme.primary + "20",
					borderLeftWidth: 4,
					borderLeftColor: theme.primary,
					borderRadius,
					padding: 14,
					marginHorizontal: 16,
					marginTop: 12,
					gap: 10,
				},
				headerRow: {
					flexDirection: "row",
					alignItems: "center",
					gap: 8,
				},
				title: {
					flex: 1,
				},
				statsRow: {
					flexDirection: "row",
					gap: 16,
					flexWrap: "wrap",
				},
				stat: {
					gap: 2,
				},
				actions: {
					flexDirection: "row",
					gap: 10,
					justifyContent: "flex-end",
				},
				applyButton: {
					backgroundColor: theme.primary,
					borderRadius: 8,
					paddingHorizontal: 14,
					paddingVertical: 8,
				},
				dismissButton: {
					borderRadius: 8,
					paddingHorizontal: 14,
					paddingVertical: 8,
					backgroundColor: theme.onSurface + "40",
				},
			}),
		[theme]
	)

	if (!suggestion) return null

	const handleApply = async () => {
		updateTargetCalories(suggestion.suggestedCalories)
		await dismiss()
	}

	return (
		<View style={styles.banner}>
			<View style={styles.headerRow}>
				<Ionicons name="bulb-outline" size={20} color={theme.primary} />
				<ThemedText type="defaultSemiBold" style={styles.title}>
					Adjust Your Calorie Target?
				</ThemedText>
			</View>

			<ThemedText type="default">
				Based on your last {suggestion.daysLogged} logged days, you&apos;re
				averaging{" "}
				<ThemedText type="defaultSemiBold">
					{suggestion.avgCalories} kcal
				</ThemedText>{" "}
				— your current target is{" "}
				<ThemedText type="defaultSemiBold">
					{suggestion.currentCalories} kcal
				</ThemedText>
				.
			</ThemedText>

			<View style={styles.statsRow}>
				<View style={styles.stat}>
					<ThemedText type="subtitleLight">Suggested</ThemedText>
					<ThemedText type="defaultSemiBold" color={theme.primary}>
						{suggestion.suggestedCalories} kcal
					</ThemedText>
				</View>
			</View>

			<View style={styles.actions}>
				<TouchableOpacity style={styles.dismissButton} onPress={dismiss}>
					<ThemedText type="subtitleBold">Dismiss</ThemedText>
				</TouchableOpacity>
				<TouchableOpacity style={styles.applyButton} onPress={handleApply}>
					<ThemedText type="subtitleBold" color={theme.background}>
						Apply
					</ThemedText>
				</TouchableOpacity>
			</View>
		</View>
	)
}
