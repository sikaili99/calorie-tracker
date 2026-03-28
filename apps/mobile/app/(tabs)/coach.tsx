import React, { useMemo, useRef } from "react"
import {
	View,
	FlatList,
	StyleSheet,
	KeyboardAvoidingView,
	Platform,
	TouchableOpacity,
} from "react-native"
import { router } from "expo-router"
import { Header } from "@/components/Header"
import { ThemedText } from "@/components/ThemedText"
import { MessageBubble } from "@/components/coachPage/MessageBubble"
import { ChatInput } from "@/components/coachPage/ChatInput"
import { CustomPressable } from "@/components/CustomPressable"
import { useThemeColor } from "@/hooks/useThemeColor"
import { useCoach } from "@/hooks/useCoach"
import { useNutritionData } from "@/hooks/useNutritionData"
import { useSummary } from "@/hooks/useSummary"
import { useSettings } from "@/providers/SettingsProvider"
import { borderRadius } from "@/constants/Theme"
import Ionicons from "@expo/vector-icons/Ionicons"

export default function CoachScreen() {
	const theme = useThemeColor()
	const today = useMemo(() => new Date(), [])
	const { mealDiaryEntries } = useNutritionData({ date: today })
	const { calculateTotal } = useSummary()
	const { targetCalories, isPremium } = useSettings()

	const todaySummary = useMemo(() => {
		return calculateTotal(mealDiaryEntries?.all ?? [])
	}, [mealDiaryEntries, calculateTotal])

	const { messages, isLoading, error, sendMessage, clearHistory } =
		useCoach(todaySummary)

	const flatListRef = useRef<FlatList>(null)

	const styles = useMemo(
		() =>
			StyleSheet.create({
				container: {
					flex: 1,
					backgroundColor: theme.background,
				},
				flex: { flex: 1 },
				emptyContainer: {
					flex: 1,
					alignItems: "center",
					justifyContent: "center",
					padding: 32,
					gap: 12,
				},
				emptyIcon: {
					width: 64,
					height: 64,
					borderRadius: 32,
					backgroundColor: theme.surface,
					alignItems: "center",
					justifyContent: "center",
					marginBottom: 8,
				},
				errorBanner: {
					backgroundColor: "#FEF2F2",
					borderRadius,
					margin: 16,
					padding: 12,
				},
				statsRow: {
					flexDirection: "row",
					justifyContent: "center",
					gap: 24,
					paddingVertical: 10,
					paddingHorizontal: 16,
					backgroundColor: theme.surface,
					marginBottom: 8,
				},
				statItem: {
					alignItems: "center",
				},
				unlockButton: {
					backgroundColor: theme.primary,
					paddingVertical: 14,
					paddingHorizontal: 28,
					borderRadius,
					alignItems: "center",
					marginTop: 8,
				},
			}),
		[theme]
	)

	if (!isPremium) {
		return (
			<View style={styles.container}>
				<Header title="AI Coach" />
				<View style={styles.emptyContainer}>
					<Ionicons
						name="lock-closed-outline"
						size={48}
						color={theme.primary}
					/>
					<ThemedText type="defaultSemiBold" centered>
						Premium Feature
					</ThemedText>
					<ThemedText type="subtitleLight" centered>
						Unlock AI Coach to get personalised nutrition guidance.
					</ThemedText>
					<CustomPressable
						borderRadius={borderRadius}
						style={styles.unlockButton}
						onPress={() => router.push("/paywall")}
					>
						<ThemedText type="defaultSemiBold" color={theme.background}>
							Unlock Premium
						</ThemedText>
					</CustomPressable>
				</View>
			</View>
		)
	}

	const headerRight =
		messages.length > 0 ? (
			<TouchableOpacity
				onPress={clearHistory}
				hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
			>
				<Ionicons name="trash-outline" size={22} color={theme.text} />
			</TouchableOpacity>
		) : undefined

	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			keyboardVerticalOffset={0}
		>
			<Header title="AI Coach" rightComponent={headerRight} />

			{/* Today's stats bar */}
			{targetCalories && (
				<View style={styles.statsRow}>
					<View style={styles.statItem}>
						<ThemedText type="subtitleBold">
							{Math.round(todaySummary.calories)}
						</ThemedText>
						<ThemedText type="subtitleLight">kcal eaten</ThemedText>
					</View>
					<View style={styles.statItem}>
						<ThemedText type="subtitleBold">
							{Math.round(targetCalories - todaySummary.calories)}
						</ThemedText>
						<ThemedText type="subtitleLight">remaining</ThemedText>
					</View>
					<View style={styles.statItem}>
						<ThemedText type="subtitleBold">
							{Math.round(todaySummary.protein)}g
						</ThemedText>
						<ThemedText type="subtitleLight">protein</ThemedText>
					</View>
				</View>
			)}

			{/* Message list or empty state */}
			{messages.length === 0 ? (
				<View style={styles.emptyContainer}>
					<View style={styles.emptyIcon}>
						<Ionicons
							name="chatbubble-ellipses-outline"
							size={32}
							color={theme.primary}
						/>
					</View>
					<ThemedText type="defaultSemiBold" centered>
						Your AI Nutrition Coach
					</ThemedText>
					<ThemedText type="subtitleLight" centered>
						Ask me anything about your nutrition, what to eat next,
						or how to hit your goals.
					</ThemedText>
				</View>
			) : (
				<FlatList
					ref={flatListRef}
					style={styles.flex}
					data={messages}
					keyExtractor={(_, i) => i.toString()}
					renderItem={({ item }) => <MessageBubble message={item} />}
					contentContainerStyle={{ paddingVertical: 12 }}
					onContentSizeChange={() =>
						flatListRef.current?.scrollToEnd({ animated: true })
					}
				/>
			)}

			{error && (
				<View style={styles.errorBanner}>
					<ThemedText type="subtitleLight" color="#EF4444">
						{error}
					</ThemedText>
				</View>
			)}

			<ChatInput onSend={sendMessage} isLoading={isLoading} />
		</KeyboardAvoidingView>
	)
}
