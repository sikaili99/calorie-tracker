import React, { useEffect, useState, useCallback } from "react"
import {
	View,
	StyleSheet,
	FlatList,
	TouchableOpacity,
	ActivityIndicator,
} from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import { ThemedText } from "@/components/ThemedText"
import { useThemeColor } from "@/hooks/useThemeColor"
import { Header } from "@/components/Header"
import { PhotoLogItem, PhotoLogItemData } from "@/components/diaryPage/PhotoLogItem"
import { usePhotoLogging } from "@/hooks/usePhotoLogging"
import { useDatabase, NewDiaryEntry } from "@/hooks/useDatabase"
import { Ionicons } from "@expo/vector-icons"
import { borderRadius } from "@/constants/Theme"

export default function PhotoLogReview() {
	const theme = useThemeColor()
	const params = useLocalSearchParams<{ imageBase64?: string; meal?: string }>()
	const meal = Number(params.meal ?? 0)

	const { items, isAnalyzing, error, analyzePhoto, removeItem, updateGrams } =
		usePhotoLogging()
	const { addDiaryEntry } = useDatabase()
	const [isAdding, setIsAdding] = useState(false)

	useEffect(() => {
		if (params.imageBase64) {
			analyzePhoto(params.imageBase64, meal)
		}
	}, [])

	const handleConfirm = useCallback(async () => {
		const validItems = items.filter((item) => item.food !== null)
		if (validItems.length === 0) return

		setIsAdding(true)
		try {
			await Promise.all(
				validItems.map((item) => {
					const entry: NewDiaryEntry = {
						quantity: item.estimatedGrams,
						isServings: false,
						date: new Date(),
						mealType: meal,
						food: item.food!,
					}
					return addDiaryEntry(entry)
				})
			)
			router.back()
			router.back() // back past photoLogger too
		} catch {
			// fall through
		} finally {
			setIsAdding(false)
		}
	}, [items, meal, addDiaryEntry])

	const styles = StyleSheet.create({
		container: { flex: 1 },
		content: { flex: 1, paddingHorizontal: 16 },
		loadingContainer: {
			flex: 1,
			justifyContent: "center",
			alignItems: "center",
			gap: 16,
		},
		errorContainer: {
			flex: 1,
			justifyContent: "center",
			alignItems: "center",
			gap: 16,
			padding: 32,
		},
		list: {
			gap: 8,
			paddingTop: 12,
			paddingBottom: 120,
		},
		emptyContainer: {
			flex: 1,
			justifyContent: "center",
			alignItems: "center",
			gap: 12,
		},
		footer: {
			position: "absolute",
			bottom: 0,
			left: 0,
			right: 0,
			backgroundColor: theme.background,
			padding: 16,
			paddingBottom: 32,
			borderTopWidth: 1,
			borderTopColor: theme.onSurface + "30",
		},
		confirmButton: {
			backgroundColor: theme.primary,
			borderRadius,
			paddingVertical: 14,
			alignItems: "center",
			flexDirection: "row",
			justifyContent: "center",
			gap: 8,
		},
		disabledButton: {
			opacity: 0.5,
		},
		retryButton: {
			backgroundColor: theme.surface,
			borderRadius,
			paddingHorizontal: 20,
			paddingVertical: 10,
		},
	})

	if (isAnalyzing) {
		return (
			<View style={[styles.container, { backgroundColor: theme.background }]}>
				<Header title="Analyzing Photo" />
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={theme.primary} />
					<ThemedText type="default">
						Identifying foods in your photo…
					</ThemedText>
				</View>
			</View>
		)
	}

	if (error) {
		return (
			<View style={[styles.container, { backgroundColor: theme.background }]}>
				<Header title="Photo Log" />
				<View style={styles.errorContainer}>
					<Ionicons
						name="cloud-offline-outline"
						size={60}
						color={theme.onSurface}
					/>
					<ThemedText type="defaultSemiBold" style={{ textAlign: "center" }}>
						{error}
					</ThemedText>
					<TouchableOpacity
						style={styles.retryButton}
						onPress={() => router.back()}
					>
						<ThemedText type="subtitleBold">Go Back</ThemedText>
					</TouchableOpacity>
				</View>
			</View>
		)
	}

	const validCount = items.filter((i) => i.food !== null).length

	return (
		<View style={[styles.container, { backgroundColor: theme.background }]}>
			<Header title="Review Photo Log" />
			<View style={styles.content}>
				{items.length === 0 ? (
					<View style={styles.emptyContainer}>
						<Ionicons
							name="search-outline"
							size={48}
							color={theme.onSurface}
						/>
						<ThemedText type="default" style={{ textAlign: "center" }}>
							No foods detected. Try again with a clearer photo.
						</ThemedText>
					</View>
				) : (
					<FlatList
						data={items}
						keyExtractor={(_, i) => i.toString()}
						contentContainerStyle={styles.list}
						renderItem={({ item, index }) => (
							<PhotoLogItem
								item={item}
								onRemove={() => removeItem(index)}
								onQuantityChange={(g) => updateGrams(index, g)}
							/>
						)}
						ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
					/>
				)}
			</View>

			{items.length > 0 && (
				<View style={styles.footer}>
					<TouchableOpacity
						style={[
							styles.confirmButton,
							validCount === 0 && styles.disabledButton,
						]}
						onPress={handleConfirm}
						disabled={validCount === 0 || isAdding}
					>
						{isAdding ? (
							<ActivityIndicator size="small" color={theme.background} />
						) : (
							<Ionicons
								name="checkmark-circle-outline"
								size={20}
								color={theme.background}
							/>
						)}
						<ThemedText type="defaultSemiBold" color={theme.background}>
							{isAdding
								? "Adding…"
								: `Add ${validCount} item${validCount !== 1 ? "s" : ""} to diary`}
						</ThemedText>
					</TouchableOpacity>
				</View>
			)}
		</View>
	)
}
