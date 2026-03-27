import React, { useMemo } from "react"
import { View, StyleSheet, TouchableOpacity } from "react-native"
import { ThemedText } from "@/components/ThemedText"
import { useThemeColor } from "@/hooks/useThemeColor"
import { DailySummary } from "@/hooks/useHistoricalData"

interface CalendarHeatmapProps {
	history: DailySummary[]
	targetCalories: number
	onDayPress?: (date: string) => void
}

function getCellColor(
	kcal: number | undefined,
	target: number,
	surfaceColor: string
): string {
	if (!kcal) return surfaceColor
	const ratio = kcal / target
	if (ratio < 0.5) return "#94A3B8" // too little — grey
	if (ratio <= 1.05) return "#10B981" // on track — green
	if (ratio <= 1.2) return "#F59E0B" // slightly over — amber
	return "#EF4444" // over — red
}

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"]
const WEEKS = 5

export const CalendarHeatmap = ({
	history,
	targetCalories,
	onDayPress,
}: CalendarHeatmapProps) => {
	const theme = useThemeColor()

	// Build a map of date → kcal
	const kcalByDate = useMemo(() => {
		const map: Record<string, number> = {}
		for (const d of history) {
			map[d.date] = d.kcal
		}
		return map
	}, [history])

	// Build the 5-week grid ending today (Monday-based)
	const cells = useMemo(() => {
		const today = new Date()
		today.setHours(0, 0, 0, 0)

		// Find last Monday
		const dayOfWeek = today.getUTCDay() || 7 // 1=Mon...7=Sun
		const lastMonday = new Date(today)
		lastMonday.setUTCDate(today.getUTCDate() - dayOfWeek + 1)

		const totalDays = WEEKS * 7
		const startDate = new Date(lastMonday)
		startDate.setUTCDate(lastMonday.getUTCDate() - (totalDays - 7))

		const result: { date: string; kcal?: number; isFuture: boolean }[] = []
		for (let i = 0; i < totalDays; i++) {
			const d = new Date(startDate)
			d.setUTCDate(startDate.getUTCDate() + i)
			const key = d.toISOString().split("T")[0]
			result.push({
				date: key,
				kcal: kcalByDate[key],
				isFuture: d > today,
			})
		}
		return result
	}, [kcalByDate])

	const styles = useMemo(
		() =>
			StyleSheet.create({
				wrapper: { width: "100%" },
				dayLabels: {
					flexDirection: "row",
					marginBottom: 4,
					paddingHorizontal: 2,
				},
				dayLabel: {
					flex: 1,
					textAlign: "center",
				},
				grid: {
					flexDirection: "column",
					gap: 4,
				},
				row: {
					flexDirection: "row",
					gap: 4,
				},
				cell: {
					flex: 1,
					aspectRatio: 1,
					borderRadius: 4,
				},
				legend: {
					flexDirection: "row",
					gap: 12,
					marginTop: 8,
					flexWrap: "wrap",
				},
				legendItem: {
					flexDirection: "row",
					alignItems: "center",
					gap: 4,
				},
				legendDot: {
					width: 10,
					height: 10,
					borderRadius: 2,
				},
			}),
		[]
	)

	// Split cells into weeks
	const weeks = useMemo(() => {
		const result: typeof cells[] = []
		for (let w = 0; w < WEEKS; w++) {
			result.push(cells.slice(w * 7, w * 7 + 7))
		}
		return result
	}, [cells])

	return (
		<View style={styles.wrapper}>
			<View style={styles.dayLabels}>
				{DAY_LABELS.map((l, i) => (
					<ThemedText
						key={i}
						type="subtitleLight"
						style={styles.dayLabel}
					>
						{l}
					</ThemedText>
				))}
			</View>
			<View style={styles.grid}>
				{weeks.map((week, wi) => (
					<View key={wi} style={styles.row}>
						{week.map((cell) => (
							<TouchableOpacity
								key={cell.date}
								style={[
									styles.cell,
									{
										backgroundColor: cell.isFuture
											? "transparent"
											: getCellColor(
													cell.kcal,
													targetCalories,
													theme.onSurface
												),
										borderWidth: cell.isFuture ? 0 : 0,
										opacity: cell.isFuture ? 0.15 : 1,
									},
								]}
								onPress={() =>
									!cell.isFuture && onDayPress?.(cell.date)
								}
								disabled={cell.isFuture}
							/>
						))}
					</View>
				))}
			</View>
			<View style={styles.legend}>
				{[
					{ color: "#10B981", label: "On track" },
					{ color: "#F59E0B", label: "Slightly over" },
					{ color: "#EF4444", label: "Over" },
					{ color: "#94A3B8", label: "Under 50%" },
					{ color: theme.onSurface, label: "No data" },
				].map(({ color, label }) => (
					<View key={label} style={styles.legendItem}>
						<View
							style={[
								styles.legendDot,
								{ backgroundColor: color },
							]}
						/>
						<ThemedText type="subtitleLight">{label}</ThemedText>
					</View>
				))}
			</View>
		</View>
	)
}
