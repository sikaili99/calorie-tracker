import React from "react"
import { useMemo } from "react"
import { ThemedText } from "../ThemedText"
import { StyleSheet, View } from "react-native"
import { useThemeColor } from "@/hooks/useThemeColor"
import { borderRadius } from "@/constants/Theme"
import { MacroProgress } from "./MacroProgress"
import { CalorieSummaryProgress } from "./CalorieSummaryProgress"
import { MacroBalanceCard } from "./MacroBalanceCard"
import { MacroTargets } from "@/utils/macroAdvice"

interface NutritionSummaryProps {
	eatenCalories: number
	totalCalories: number
	eatenCarbs: number
	totalCarbs: number
	eatenProtein: number
	totalProtein: number
	eatenFat: number
	totalFat: number
	projectedCalories?: number
	macroTargets?: MacroTargets
}

export const NutritionSummary = ({
	eatenCalories,
	totalCalories,
	eatenCarbs,
	totalCarbs,
	eatenProtein,
	totalProtein,
	eatenFat,
	totalFat,
	projectedCalories,
	macroTargets,
}: NutritionSummaryProps) => {
	const theme = useThemeColor()
	const styles = useMemo(
		() =>
			StyleSheet.create({
				mainContainer: {
					width: "100%",
				},
				headerRow: {
					width: "100%",
					flexDirection: "row",
					justifyContent: "flex-start",
					alignItems: "flex-start",
				},
				card: {
					width: "100%",
					backgroundColor: theme.surface,
					borderRadius: borderRadius,
					padding: 16,
					marginVertical: 8,
				},
				itemsRow: {
					flexDirection: "row",
					justifyContent: "space-evenly",
					gap: 16,
					alignItems: "center",
					marginBottom: 8,
				},
				calorieSideItem: {
					flexDirection: "column",
					alignItems: "center",
				},
				calorieCenterItem: {
					flexDirection: "column",
					alignItems: "center",
				},
				macroItem: {
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
				},
				projectedRow: {
					alignItems: "center",
					marginTop: 4,
					marginBottom: 4,
				},
			}),
		[theme, borderRadius]
	)

	const calorieProgress = useMemo(
		() => (eatenCalories / totalCalories) * 100,
		[eatenCalories, totalCalories]
	)
	const carbsProgress = useMemo(
		() => (eatenCarbs / totalCarbs) * 100,
		[eatenCarbs, totalCarbs]
	)
	const proteinProgress = useMemo(
		() => (eatenProtein / totalProtein) * 100,
		[eatenProtein, totalProtein]
	)
	const fatProgress = useMemo(
		() => (eatenFat / totalFat) * 100,
		[eatenFat, totalFat]
	)

	return (
		<View style={styles.mainContainer}>
			<View style={styles.headerRow}>
				<ThemedText type="default">Summary</ThemedText>
			</View>
			<View style={styles.card}>
				<View style={styles.itemsRow}>
					<View style={styles.calorieSideItem}>
						<ThemedText type="default">
							{Math.round(eatenCalories)}
						</ThemedText>
						<ThemedText type="subtitleLight">Eaten</ThemedText>
					</View>
					<View style={styles.calorieCenterItem}>
						<CalorieSummaryProgress progress={calorieProgress}>
							<ThemedText type="title">
								{Math.abs(
									Math.round(totalCalories - eatenCalories)
								)}
							</ThemedText>
							<ThemedText type="subtitleLight">
								{totalCalories > eatenCalories
									? "Remaining"
									: "Over"}
							</ThemedText>
						</CalorieSummaryProgress>
					</View>
					<View style={styles.calorieSideItem}>
						<ThemedText type="default">{totalCalories}</ThemedText>
						<ThemedText type="subtitleLight">Total</ThemedText>
					</View>
				</View>
				{projectedCalories !== undefined && (
					<View style={styles.projectedRow}>
						<ThemedText
							type="subtitleLight"
							color={theme.text}
							style={{ opacity: 0.55 }}
						>
							Projected: {projectedCalories} kcal
						</ThemedText>
					</View>
				)}
				<View style={styles.itemsRow}>
					<View style={styles.macroItem}>
						<ThemedText type="subtitleLight">Carbs</ThemedText>
						<MacroProgress progress={carbsProgress} />
						<ThemedText type="subtitleBold">
							{eatenCarbs.toFixed(0)} / {totalCarbs.toFixed(0)} g
						</ThemedText>
					</View>
					<View style={styles.macroItem}>
						<ThemedText type="subtitleLight">Protein</ThemedText>
						<MacroProgress progress={proteinProgress} />
						<ThemedText type="subtitleBold">
							{eatenProtein.toFixed(0)} /{" "}
							{totalProtein.toFixed(0)} g
						</ThemedText>
					</View>
					<View style={styles.macroItem}>
						<ThemedText type="subtitleLight">Fat</ThemedText>
						<MacroProgress progress={fatProgress} />
						<ThemedText type="subtitleBold">
							{eatenFat.toFixed(0)} / {totalFat.toFixed(0)} g
						</ThemedText>
					</View>
				</View>
			</View>
			{macroTargets && (
				<MacroBalanceCard
					eaten={{
						calories: eatenCalories,
						protein: eatenProtein,
						carbs: eatenCarbs,
						fat: eatenFat,
					}}
					targets={macroTargets}
				/>
			)}
		</View>
	)
}
