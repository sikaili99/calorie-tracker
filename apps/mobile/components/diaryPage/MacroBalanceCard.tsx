import React, { useMemo } from "react"
import { View, StyleSheet } from "react-native"
import { ThemedText } from "@/components/ThemedText"
import { useThemeColor } from "@/hooks/useThemeColor"
import { borderRadius } from "@/constants/Theme"
import { getMacroAdvice, MacroSummary, MacroTargets } from "@/utils/macroAdvice"

interface MacroBalanceCardProps {
	eaten: MacroSummary
	targets: MacroTargets
}

const MACRO_COLORS = {
	carbs: "#F59E0B",
	protein: "#5BBEF9",
	fat: "#10B981",
}

export const MacroBalanceCard = ({
	eaten,
	targets,
}: MacroBalanceCardProps) => {
	const theme = useThemeColor()

	const advice = useMemo(
		() => getMacroAdvice(eaten, targets),
		[eaten, targets]
	)

	// Total grams eaten for proportional bar
	const totalEaten = eaten.carbs + eaten.protein + eaten.fat
	const totalTarget = targets.carbs + targets.protein + targets.fat

	const carbWidth =
		totalTarget > 0 ? (targets.carbs / totalTarget) * 100 : 33
	const proteinWidth =
		totalTarget > 0 ? (targets.protein / totalTarget) * 100 : 34
	const fatWidth =
		totalTarget > 0 ? (targets.fat / totalTarget) * 100 : 33

	// Eaten proportions
	const eCarbWidth =
		totalEaten > 0 ? (eaten.carbs / totalEaten) * 100 : 0
	const eProteinWidth =
		totalEaten > 0 ? (eaten.protein / totalEaten) * 100 : 0
	const eFatWidth =
		totalEaten > 0 ? (eaten.fat / totalEaten) * 100 : 0

	const styles = useMemo(
		() =>
			StyleSheet.create({
				card: {
					width: "100%",
					backgroundColor: theme.surface,
					borderRadius,
					padding: 14,
					marginTop: 8,
					gap: 10,
				},
				barContainer: {
					height: 8,
					flexDirection: "row",
					borderRadius: 4,
					overflow: "hidden",
					backgroundColor: theme.onSurface,
				},
				targetBar: {
					height: 4,
					flexDirection: "row",
					borderRadius: 2,
					overflow: "hidden",
					opacity: 0.35,
				},
				legend: {
					flexDirection: "row",
					justifyContent: "space-between",
				},
				legendItem: {
					flexDirection: "row",
					alignItems: "center",
					gap: 4,
				},
				dot: {
					width: 8,
					height: 8,
					borderRadius: 4,
				},
				adviceText: {
					marginTop: 2,
				},
			}),
		[theme]
	)

	return (
		<View style={styles.card}>
			{/* Eaten bar */}
			<View style={styles.barContainer}>
				<View
					style={{
						width: `${eCarbWidth}%`,
						backgroundColor: MACRO_COLORS.carbs,
					}}
				/>
				<View
					style={{
						width: `${eProteinWidth}%`,
						backgroundColor: MACRO_COLORS.protein,
					}}
				/>
				<View
					style={{
						width: `${eFatWidth}%`,
						backgroundColor: MACRO_COLORS.fat,
					}}
				/>
			</View>
			{/* Target bar (ghost) */}
			<View style={styles.targetBar}>
				<View
					style={{
						width: `${carbWidth}%`,
						backgroundColor: MACRO_COLORS.carbs,
					}}
				/>
				<View
					style={{
						width: `${proteinWidth}%`,
						backgroundColor: MACRO_COLORS.protein,
					}}
				/>
				<View
					style={{
						width: `${fatWidth}%`,
						backgroundColor: MACRO_COLORS.fat,
					}}
				/>
			</View>
			{/* Legend */}
			<View style={styles.legend}>
				{(
					[
						["carbs", "Carbs"],
						["protein", "Protein"],
						["fat", "Fat"],
					] as const
				).map(([key, label]) => (
					<View key={key} style={styles.legendItem}>
						<View
							style={[
								styles.dot,
								{ backgroundColor: MACRO_COLORS[key] },
							]}
						/>
						<ThemedText type="subtitleLight">{label}</ThemedText>
					</View>
				))}
			</View>
			{/* Advice */}
			<ThemedText type="subtitleLight" style={styles.adviceText}>
				{advice}
			</ThemedText>
		</View>
	)
}
