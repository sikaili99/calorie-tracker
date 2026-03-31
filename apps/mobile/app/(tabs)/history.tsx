import React, { useCallback } from "react"
import { View, ScrollView, StyleSheet } from "react-native"
import { Header } from "@/components/Header"
import { useThemeColor } from "@/hooks/useThemeColor"
import { useHistoricalData } from "@/hooks/useHistoricalData"
import { useWeeklyReport } from "@/hooks/useWeeklyReport"
import { useSettings } from "@/providers/SettingsProvider"
import { CalendarHeatmap } from "@/components/historyPage/CalendarHeatmap"
import { WeeklyReportCard } from "@/components/historyPage/WeeklyReportCard"
import { ThemedText } from "@/components/ThemedText"
import { router } from "expo-router"

export default function HistoryTab() {
	const theme = useThemeColor()
	const { targetCalories, isPremium } = useSettings()
	const { dailySummaries } = useHistoricalData(35)
	const { report, isGenerating, error, generateReport } = useWeeklyReport()

	const handleDayPress = useCallback((date: string) => {
		// Navigate to diary with the selected date
		// We use router.push with a date param; diary.tsx reads it from params
		router.push({
			pathname: "/diary",
			params: { date },
		})
	}, [])

	const styles = StyleSheet.create({
		container: { flex: 1 },
		content: {
			flex: 1,
		},
		section: {
			paddingHorizontal: 16,
			paddingTop: 16,
			gap: 8,
		},
		sectionTitle: {
			marginBottom: 4,
		},
	})

	return (
		<View style={[styles.container, { backgroundColor: theme.background }]}>
			<Header title="History" />
			<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
				<View style={styles.section}>
					<ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
						Activity Heatmap
					</ThemedText>
					<CalendarHeatmap
						history={dailySummaries}
						targetCalories={targetCalories ?? 2000}
						onDayPress={handleDayPress}
					/>
				</View>

				<View style={styles.section}>
					<WeeklyReportCard
						report={report}
						isGenerating={isGenerating}
						error={error}
						onGenerate={generateReport}
						isPremium={isPremium}
						onPaywall={() => router.push("/paywall")}
					/>
				</View>

				<View style={{ height: 32 }} />
			</ScrollView>
		</View>
	)
}
