import React, { useMemo } from "react"
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { ThemedText } from "@/components/ThemedText"
import { useThemeColor } from "@/hooks/useThemeColor"
import { borderRadius } from "@/constants/Theme"
import { Insight } from "@/utils/insightRules"
import Ionicons from "@expo/vector-icons/Ionicons"

interface InsightsCardProps {
	insights: Insight[]
}

const TYPE_COLORS = {
	warning: "#F59E0B",
	positive: "#10B981",
	info: "#5BBEF9",
}

export const InsightsCard = ({ insights }: InsightsCardProps) => {
	const theme = useThemeColor()

	const styles = useMemo(
		() =>
			StyleSheet.create({
				wrapper: {
					width: "100%",
					marginBottom: 8,
				},
				label: {
					marginBottom: 8,
				},
				pill: {
					backgroundColor: theme.surface,
					borderRadius: borderRadius,
					padding: 12,
					marginRight: 12,
					width: 240,
					flexDirection: "row",
					alignItems: "flex-start",
					gap: 10,
					borderLeftWidth: 3,
				},
				textBlock: {
					flex: 1,
				},
				titleRow: {
					marginBottom: 2,
				},
			}),
		[theme]
	)

	if (insights.length === 0) return null

	return (
		<View style={styles.wrapper}>
			<ThemedText type="default" style={styles.label}>
				Insights
			</ThemedText>
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={{ paddingRight: 4 }}
			>
				{insights.map((insight) => {
					const color = TYPE_COLORS[insight.type]
					return (
						<View
							key={insight.id}
							style={[styles.pill, { borderLeftColor: color }]}
						>
							<Ionicons
								name={insight.icon as any}
								size={20}
								color={color}
							/>
							<View style={styles.textBlock}>
								<ThemedText
									type="subtitleBold"
									style={styles.titleRow}
								>
									{insight.title}
								</ThemedText>
								<ThemedText type="subtitleLight">
									{insight.body}
								</ThemedText>
							</View>
						</View>
					)
				})}
			</ScrollView>
		</View>
	)
}
