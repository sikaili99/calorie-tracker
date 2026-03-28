import React, { useMemo, useRef } from "react"
import {
	View,
	FlatList,
	StyleSheet,
	KeyboardAvoidingView,
	Platform,
	ActivityIndicator,
} from "react-native"
import { Header } from "@/components/Header"
import { ThemedText } from "@/components/ThemedText"
import { MessageBubble } from "@/components/coachPage/MessageBubble"
import { ChatInput } from "@/components/coachPage/ChatInput"
import { CustomPressable } from "@/components/CustomPressable"
import { PremiumGate } from "@/components/PremiumGate"
import { EmptyState } from "@/components/EmptyState"
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
				errorBanner: {
					backgroundColor: theme.errorSurface,
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
				typingRow: {
					flexDirection: "row",
					alignItems: "center",
					paddingHorizontal: 16,
					paddingVertical: 8,
				},
			}),
		[theme]
	)

	if (!isPremium) {
		return (
			<View style={styles.container}>
				<Header title="AI Coach" />
				<PremiumGate
					title="Premium Feature"
					description="Unlock AI Coach to get personalised nutrition guidance."
				/>
			</View>
		)
	}

	const headerRight =
		messages.length > 0 ? (
			<CustomPressable
				borderRadius={24}
				onPress={clearHistory}
				hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
			>
				<Ionicons name="trash-outline" size={22} color={theme.text} />
			</CustomPressable>
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
				<EmptyState
					iconName="chatbubble-ellipses-outline"
					title="Your AI Nutrition Coach"
					subtitle="Ask me anything about your nutrition, what to eat next, or how to hit your goals."
				/>
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
					ListFooterComponent={
						isLoading ? (
							<View style={styles.typingRow}>
								<ThemedText
									type="subtitleLight"
									color={theme.primary}
								>
									Coach is typing…
								</ThemedText>
								<ActivityIndicator
									size="small"
									color={theme.primary}
									style={{ marginLeft: 8 }}
								/>
							</View>
						) : null
					}
				/>
			)}

			{error && (
				<View style={styles.errorBanner}>
					<ThemedText type="subtitleLight" color={theme.error}>
						{error}
					</ThemedText>
				</View>
			)}

			<ChatInput onSend={sendMessage} isLoading={isLoading} />
		</KeyboardAvoidingView>
	)
}
