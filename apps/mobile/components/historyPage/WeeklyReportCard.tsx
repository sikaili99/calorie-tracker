import React, { useMemo, useCallback } from "react"
import {
	View,
	StyleSheet,
	TouchableOpacity,
	ActivityIndicator,
	Share,
} from "react-native"
import { ThemedText } from "@/components/ThemedText"
import { useThemeColor } from "@/hooks/useThemeColor"
import { borderRadius } from "@/constants/Theme"
import { WeeklyReport } from "@/interfaces/WeeklyReport"
import { Ionicons } from "@expo/vector-icons"

interface WeeklyReportCardProps {
	report: WeeklyReport | null
	isGenerating: boolean
	error: string | null
	onGenerate: () => void
	isPremium: boolean
	onPaywall: () => void
}

export const WeeklyReportCard = ({
	report,
	isGenerating,
	error,
	onGenerate,
	isPremium,
	onPaywall,
}: WeeklyReportCardProps) => {
	const theme = useThemeColor()

	const styles = useMemo(
		() =>
			StyleSheet.create({
				card: {
					backgroundColor: theme.surface,
					borderRadius,
					padding: 16,
					gap: 16,
				},
				headerRow: {
					flexDirection: "row",
					justifyContent: "space-between",
					alignItems: "center",
				},
				generateButton: {
					backgroundColor: theme.primary,
					borderRadius: 8,
					paddingHorizontal: 14,
					paddingVertical: 8,
					flexDirection: "row",
					alignItems: "center",
					gap: 6,
				},
				section: {
					gap: 6,
				},
				sectionTitle: {
					marginBottom: 2,
				},
				bullet: {
					flexDirection: "row",
					gap: 8,
					alignItems: "flex-start",
				},
				errorRow: {
					flexDirection: "row",
					alignItems: "center",
					gap: 8,
					backgroundColor: theme.onSurface + "30",
					borderRadius: 8,
					padding: 10,
				},
				emptyContainer: {
					alignItems: "center",
					gap: 12,
					paddingVertical: 8,
				},
				shareButton: {
					padding: 4,
				},
			}),
		[theme]
	)

	const handleShare = useCallback(async () => {
		if (!report) return
		const text = [
			`Weekly Report (${report.weekStartDate})`,
			"",
			report.weekSummary,
			"",
			"Macro Analysis:",
			report.macroAnalysis,
			"",
			"Top Foods:",
			...report.topFoods.map((f) => `• ${f}`),
			"",
			"Patterns:",
			...report.patterns.map((p) => `• ${p}`),
			"",
			"Recommendations:",
			...report.recommendations.map((r) => `• ${r}`),
		].join("\n")

		await Share.share({ message: text })
	}, [report])

	return (
		<View style={styles.card}>
			<View style={styles.headerRow}>
				<ThemedText type="defaultSemiBold">Weekly Report</ThemedText>
				<View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
					{report && (
						<TouchableOpacity
							style={styles.shareButton}
							onPress={handleShare}
							hitSlop={8}
						>
							<Ionicons
								name="share-outline"
								size={22}
								color={theme.primary}
							/>
						</TouchableOpacity>
					)}
					<TouchableOpacity
						style={styles.generateButton}
						onPress={isPremium ? onGenerate : onPaywall}
						disabled={isGenerating}
					>
						{isGenerating ? (
							<ActivityIndicator size="small" color={theme.background} />
						) : isPremium ? (
							<Ionicons name="sparkles" size={16} color={theme.background} />
						) : (
							<Ionicons
								name="lock-closed-outline"
								size={16}
								color={theme.background}
							/>
						)}
						<ThemedText
							type="subtitleBold"
							color={theme.background}
						>
							{isGenerating ? "Generating…" : report ? "Refresh" : "Generate"}
						</ThemedText>
					</TouchableOpacity>
				</View>
			</View>

			{error && (
				<View style={styles.errorRow}>
					<Ionicons name="cloud-offline-outline" size={18} color={theme.text} />
					<ThemedText type="subtitleLight" style={{ flex: 1 }}>
						{error}
					</ThemedText>
				</View>
			)}

			{!report && !isGenerating && !error && (
				<View style={styles.emptyContainer}>
					<Ionicons
						name="bar-chart-outline"
						size={40}
						color={theme.onSurface}
					/>
					<ThemedText type="subtitleLight" style={{ textAlign: "center" }}>
						Generate your AI weekly report to get personalized insights and
						recommendations.
					</ThemedText>
				</View>
			)}

			{report && (
				<>
					<View style={styles.section}>
						<ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
							Summary
						</ThemedText>
						<ThemedText type="default">{report.weekSummary}</ThemedText>
					</View>

					<View style={styles.section}>
						<ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
							Macros
						</ThemedText>
						<ThemedText type="default">{report.macroAnalysis}</ThemedText>
					</View>

					{report.topFoods.length > 0 && (
						<View style={styles.section}>
							<ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
								Top Foods
							</ThemedText>
							{report.topFoods.map((food, i) => (
								<View key={i} style={styles.bullet}>
									<ThemedText type="subtitleLight">•</ThemedText>
									<ThemedText type="default" style={{ flex: 1 }}>
										{food}
									</ThemedText>
								</View>
							))}
						</View>
					)}

					{report.patterns.length > 0 && (
						<View style={styles.section}>
							<ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
								Patterns
							</ThemedText>
							{report.patterns.map((pattern, i) => (
								<View key={i} style={styles.bullet}>
									<ThemedText type="subtitleLight">•</ThemedText>
									<ThemedText type="default" style={{ flex: 1 }}>
										{pattern}
									</ThemedText>
								</View>
							))}
						</View>
					)}

					{report.recommendations.length > 0 && (
						<View style={styles.section}>
							<ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
								Recommendations
							</ThemedText>
							{report.recommendations.map((rec, i) => (
								<View key={i} style={styles.bullet}>
									<Ionicons
										name="checkmark-circle-outline"
										size={16}
										color={theme.primary}
										style={{ marginTop: 2 }}
									/>
									<ThemedText type="default" style={{ flex: 1 }}>
										{rec}
									</ThemedText>
								</View>
							))}
						</View>
					)}

					<ThemedText type="subtitleLight" style={{ textAlign: "right" }}>
						Generated{" "}
						{new Date(report.generatedAt).toLocaleDateString(undefined, {
							month: "short",
							day: "numeric",
							hour: "2-digit",
							minute: "2-digit",
						})}
					</ThemedText>
				</>
			)}
		</View>
	)
}
