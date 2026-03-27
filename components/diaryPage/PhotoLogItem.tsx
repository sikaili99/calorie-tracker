import React, { useMemo } from "react"
import { View, StyleSheet, TouchableOpacity } from "react-native"
import { ThemedText } from "@/components/ThemedText"
import { useThemeColor } from "@/hooks/useThemeColor"
import { borderRadius } from "@/constants/Theme"
import { Ionicons } from "@expo/vector-icons"
import { Food } from "@/hooks/useDatabase"

export interface PhotoLogItemData {
	estimatedGrams: number
	confidence: "high" | "medium" | "low"
	food: Food | null
	rawName: string
}

interface PhotoLogItemProps {
	item: PhotoLogItemData
	onRemove: () => void
	onQuantityChange: (grams: number) => void
}

const CONFIDENCE_COLORS = {
	high: "#10B981",
	medium: "#F59E0B",
	low: "#94A3B8",
}

export const PhotoLogItem = ({
	item,
	onRemove,
	onQuantityChange,
}: PhotoLogItemProps) => {
	const theme = useThemeColor()

	const styles = useMemo(
		() =>
			StyleSheet.create({
				container: {
					backgroundColor: theme.surface,
					borderRadius,
					padding: 14,
					flexDirection: "row",
					alignItems: "center",
					gap: 12,
				},
				info: {
					flex: 1,
					gap: 4,
				},
				confidenceRow: {
					flexDirection: "row",
					alignItems: "center",
					gap: 4,
				},
				confidenceDot: {
					width: 8,
					height: 8,
					borderRadius: 4,
				},
				quantityRow: {
					flexDirection: "row",
					alignItems: "center",
					gap: 8,
				},
				quantityButton: {
					backgroundColor: theme.onSurface + "40",
					borderRadius: 6,
					width: 28,
					height: 28,
					alignItems: "center",
					justifyContent: "center",
				},
			}),
		[theme]
	)

	const kcal = item.food
		? Math.round(
				(item.food.caloriesPer100g * item.estimatedGrams) / 100
		  )
		: null

	return (
		<View style={styles.container}>
			<View style={styles.info}>
				<ThemedText type="defaultSemiBold" numberOfLines={1}>
					{item.food?.name ?? item.rawName}
				</ThemedText>
				{item.food && (
					<ThemedText type="subtitleLight">
						{item.estimatedGrams}g{kcal != null ? ` · ${kcal} kcal` : ""}
					</ThemedText>
				)}
				{!item.food && (
					<ThemedText type="subtitleLight" color="#F59E0B">
						No match found
					</ThemedText>
				)}
				<View style={styles.confidenceRow}>
					<View
						style={[
							styles.confidenceDot,
							{ backgroundColor: CONFIDENCE_COLORS[item.confidence] },
						]}
					/>
					<ThemedText type="subtitleLight">
						{item.confidence} confidence
					</ThemedText>
				</View>
			</View>

			{item.food && (
				<View style={styles.quantityRow}>
					<TouchableOpacity
						style={styles.quantityButton}
						hitSlop={4}
						onPress={() =>
							onQuantityChange(Math.max(10, item.estimatedGrams - 10))
						}
					>
						<Ionicons name="remove" size={16} color={theme.text} />
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.quantityButton}
						hitSlop={4}
						onPress={() => onQuantityChange(item.estimatedGrams + 10)}
					>
						<Ionicons name="add" size={16} color={theme.text} />
					</TouchableOpacity>
				</View>
			)}

			<TouchableOpacity hitSlop={8} onPress={onRemove}>
				<Ionicons name="close-circle-outline" size={22} color={theme.onSurface} />
			</TouchableOpacity>
		</View>
	)
}
