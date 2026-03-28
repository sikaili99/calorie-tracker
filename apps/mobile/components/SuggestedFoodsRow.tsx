import React, { useMemo } from "react"
import {
	View,
	StyleSheet,
	FlatList,
	TouchableOpacity,
} from "react-native"
import { ThemedText } from "@/components/ThemedText"
import { useThemeColor } from "@/hooks/useThemeColor"
import { borderRadius } from "@/constants/Theme"
import { Food } from "@/hooks/useDatabase"

interface SuggestedFoodsRowProps {
	foods: Food[]
	onFoodPress: (food: Food) => void
}

export const SuggestedFoodsRow = ({
	foods,
	onFoodPress,
}: SuggestedFoodsRowProps) => {
	const theme = useThemeColor()

	const styles = useMemo(
		() =>
			StyleSheet.create({
				wrapper: {
					width: "100%",
					paddingHorizontal: 16,
					marginBottom: 4,
				},
				label: {
					marginBottom: 8,
				},
				card: {
					backgroundColor: theme.surface,
					borderRadius,
					padding: 12,
					marginRight: 10,
					width: 140,
					justifyContent: "space-between",
					gap: 4,
				},
				calRow: {
					flexDirection: "row",
					alignItems: "baseline",
					gap: 2,
				},
			}),
		[theme]
	)

	if (foods.length === 0) return null

	const calories = (food: Food) => {
		if (food.servingQuantity > 0) {
			return Math.round(
				(food.servingQuantity * food.caloriesPer100g) / 100
			)
		}
		return Math.round(food.caloriesPer100g)
	}

	return (
		<View style={styles.wrapper}>
			<ThemedText type="default" style={styles.label}>
				Suggested for you
			</ThemedText>
			<FlatList
				data={foods}
				horizontal
				showsHorizontalScrollIndicator={false}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<TouchableOpacity
						style={styles.card}
						onPress={() => onFoodPress(item)}
						activeOpacity={0.7}
					>
						<ThemedText
							type="subtitleBold"
							numberOfLines={2}
						>
							{item.name}
						</ThemedText>
						{item.brand ? (
							<ThemedText
								type="subtitleLight"
								numberOfLines={1}
							>
								{item.brand}
							</ThemedText>
						) : null}
						<View style={styles.calRow}>
							<ThemedText type="subtitleBold">
								{calories(item)}
							</ThemedText>
							<ThemedText type="subtitleLight"> kcal</ThemedText>
						</View>
					</TouchableOpacity>
				)}
			/>
		</View>
	)
}
