import React, { useMemo, useRef } from "react"
import {
	View,
	FlatList,
	StyleSheet,
	KeyboardAvoidingView,
	Platform,
	ActivityIndicator,
	ScrollView,
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
import { useSubscription } from "@/providers/SubscriptionProvider"
import { borderRadius } from "@/constants/Theme"
import Ionicons from "@expo/vector-icons/Ionicons"

const STARTER_PROMPTS = [
	"What should I eat next to hit my protein target?",
	"Give me a low-calorie dinner idea with high protein.",
	"How am I doing vs my calories today?",
	"Suggest a healthy snack under 250 kcal.",
]

export default function CoachScreen() {
	const theme = useThemeColor()
	const today = useMemo(() => new Date(), [])
	const { mealDiaryEntries } = useNutritionData({ date: today })
	const { calculateTotal } = useSummary()
	const { targetCalories } = useSettings()
	const { isPremium } = useSubscription()

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
					gap: 8,
				},
				statsCard: {
					flexDirection: "row",
					justifyContent: "space-between",
					gap: 10,
					padding: 12,
					paddingHorizontal: 16,
					backgroundColor: theme.surface,
					borderRadius,
					marginHorizontal: 16,
					marginBottom: 8,
					borderWidth: 1,
					borderColor: theme.onSurface,
				},
				statItem: {
					flex: 1,
					alignItems: "flex-start",
					backgroundColor: theme.background,
					borderRadius: 10,
					paddingHorizontal: 10,
					paddingVertical: 8,
					gap: 3,
				},
				statLabelRow: {
					flexDirection: "row",
					alignItems: "center",
					gap: 5,
				},
				typingRow: {
					flexDirection: "row",
					alignItems: "center",
					backgroundColor: theme.surface,
					borderRadius,
					paddingHorizontal: 16,
					paddingVertical: 10,
					marginHorizontal: 16,
					marginBottom: 10,
					gap: 8,
					borderWidth: 1,
					borderColor: theme.onSurface,
				},
				promptSection: {
					paddingHorizontal: 16,
					paddingBottom: 8,
					gap: 8,
				},
				promptScroller: {
					marginHorizontal: -2,
				},
				promptRow: {
					flexDirection: "row",
					gap: 8,
					paddingHorizontal: 2,
				},
				promptChip: {
					backgroundColor: theme.surface,
					borderRadius: 999,
					paddingVertical: 8,
					paddingHorizontal: 12,
					borderWidth: 1,
					borderColor: theme.onSurface,
				},
				promptChipDisabled: {
					opacity: 0.55,
				},
				listContent: {
					paddingVertical: 12,
					gap: 4,
				},
				emptyState: {
					flex: 0,
					paddingTop: 18,
					paddingBottom: 8,
				},
				errorActions: {
					flexDirection: "row",
					justifyContent: "flex-end",
				},
			}),
		[theme]
	)

	const handlePromptPress = (prompt: string) => {
		if (isLoading) return
		sendMessage(prompt)
	}

	const retryPrompt =
		[...messages].reverse().find((message) => message.role === "user")
			?.content ?? "Can you try that again with a simpler suggestion?"

	const renderPromptChips = () => (
		<View style={styles.promptSection}>
			<ThemedText type="subtitleBold">Quick prompts</ThemedText>
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={styles.promptRow}
				style={styles.promptScroller}
			>
				{STARTER_PROMPTS.map((prompt) => (
					<CustomPressable
						key={prompt}
						borderRadius={999}
						style={[
							styles.promptChip,
							isLoading && styles.promptChipDisabled,
						]}
						onPress={() => handlePromptPress(prompt)}
						disabled={isLoading}
					>
						<ThemedText type="subtitle">{prompt}</ThemedText>
					</CustomPressable>
				))}
			</ScrollView>
		</View>
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
				<View style={styles.statsCard}>
					<View style={styles.statItem}>
						<View style={styles.statLabelRow}>
							<Ionicons
								name="flame-outline"
								size={14}
								color={theme.primary}
							/>
							<ThemedText type="subtitleLight">Eaten</ThemedText>
						</View>
						<ThemedText type="subtitleBold">
							{Math.round(todaySummary.calories)} kcal
						</ThemedText>
					</View>
					<View style={styles.statItem}>
						<View style={styles.statLabelRow}>
							<Ionicons
								name="trending-up-outline"
								size={14}
								color={theme.primary}
							/>
							<ThemedText type="subtitleLight">
								Remaining
							</ThemedText>
						</View>
						<ThemedText type="subtitleBold">
							{Math.round(targetCalories - todaySummary.calories)}
						</ThemedText>
					</View>
					<View style={styles.statItem}>
						<View style={styles.statLabelRow}>
							<Ionicons
								name="barbell-outline"
								size={14}
								color={theme.primary}
							/>
							<ThemedText type="subtitleLight">
								Protein
							</ThemedText>
						</View>
						<ThemedText type="subtitleBold">
							{Math.round(todaySummary.protein)}g
						</ThemedText>
					</View>
				</View>
			)}

			{/* Message list or empty state */}
			{messages.length === 0 ? (
				<View style={styles.flex}>
					<EmptyState
						iconName="chatbubble-ellipses-outline"
						title="Your AI Nutrition Coach"
						subtitle="Ask for meal ideas, macro guidance, or help staying on track today."
						style={styles.emptyState}
					/>
					{renderPromptChips()}
				</View>
			) : (
				<FlatList
					ref={flatListRef}
					style={styles.flex}
					data={messages}
					keyExtractor={(_, i) => i.toString()}
					renderItem={({ item }) => <MessageBubble message={item} />}
					contentContainerStyle={styles.listContent}
					onContentSizeChange={() =>
						flatListRef.current?.scrollToEnd({ animated: true })
					}
					ListFooterComponent={
						isLoading ? (
							<View style={styles.typingRow}>
								<Ionicons
									name="sparkles-outline"
									size={16}
									color={theme.primary}
								/>
								<ThemedText
									type="subtitle"
									color={theme.primary}
								>
									Coach is thinking…
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
					<View style={styles.errorActions}>
						<CustomPressable
							borderRadius={borderRadius}
							onPress={() => handlePromptPress(retryPrompt)}
						>
							<ThemedText type="subtitleBold" color={theme.error}>
								Try again
							</ThemedText>
						</CustomPressable>
					</View>
				</View>
			)}

			{messages.length > 0 && renderPromptChips()}
			<ChatInput onSend={sendMessage} isLoading={isLoading} />
		</KeyboardAvoidingView>
	)
}
