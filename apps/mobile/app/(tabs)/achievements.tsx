import { Header } from "@/components/Header"
import { ThemedText } from "@/components/ThemedText"
import { useAchievements } from "@/hooks/useAchievements"
import { useStreak } from "@/hooks/useStreak"
import { useDatabase } from "@/hooks/useDatabase"
import { useThemeColor } from "@/hooks/useThemeColor"
import { borderRadius } from "@/constants/Theme"
import { UserStats } from "@/interfaces/Achievements"
import Ionicons from "@expo/vector-icons/Ionicons"
import React, { useMemo, useState, useEffect, useCallback } from "react"
import { View, StyleSheet, FlatList } from "react-native"
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withSpring,
	withTiming,
} from "react-native-reanimated"

type Achievement = ReturnType<typeof useAchievements>["achievements"][number]

const AchievementCard = ({
	item,
	styles,
}: {
	item: Achievement
	styles: ReturnType<typeof StyleSheet.create>
}) => {
	const theme = useThemeColor()
	const scale = useSharedValue(item.isUnlocked ? 1 : 1)

	useEffect(() => {
		if (item.isUnlocked) {
			scale.value = withSpring(1.08, { damping: 6 }, () => {
				scale.value = withTiming(1)
			})
		}
	}, [item.isUnlocked])

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}))

	return (
		<Animated.View
			style={[
				animatedStyle,
				styles.card,
				!item.isUnlocked && styles.cardLocked,
			]}
		>
			<View
				style={[
					styles.iconContainer,
					item.isUnlocked && styles.iconContainerUnlocked,
				]}
			>
				<Ionicons
					name={item.icon as any}
					size={24}
					color={item.isUnlocked ? theme.primary : theme.text}
				/>
			</View>
			<View style={styles.textContainer}>
				<ThemedText type="defaultSemiBold">{item.title}</ThemedText>
				{item.isUnlocked ? (
					<ThemedText type="subtitleLight">{item.description}</ThemedText>
				) : (
					<ThemedText type="subtitleLight" color={theme.primary}>
						How to unlock: {item.description}
					</ThemedText>
				)}
				{item.isUnlocked && item.unlockedAt && (
					<ThemedText
						type="subtitleLight"
						style={styles.unlockedDate}
						color={theme.primary}
					>
						Unlocked{" "}
						{new Date(item.unlockedAt).toLocaleDateString()}
					</ThemedText>
				)}
			</View>
			{item.isUnlocked && (
				<Ionicons
					name="checkmark-circle"
					size={22}
					color={theme.primary}
				/>
			)}
		</Animated.View>
	)
}

export default function AchievementsScreen() {
	const theme = useThemeColor()
	const { currentStreak, longestStreak } = useStreak()
	const { fetchTotalEntryCount } = useDatabase()
	const [totalEntries, setTotalEntries] = useState(0)

	useEffect(() => {
		fetchTotalEntryCount()
			.then(setTotalEntries)
			.catch(() => {})
	}, [fetchTotalEntryCount])

	const stats: UserStats = useMemo(
		() => ({
			totalEntries,
			currentStreak,
			longestStreak,
			totalDaysLogged: 0,
			hasScannedBarcode: false,
		}),
		[totalEntries, currentStreak, longestStreak]
	)

	const { achievements } = useAchievements(stats)

	const styles = useMemo(
		() =>
			StyleSheet.create({
				container: {
					flex: 1,
					backgroundColor: theme.background,
				},
				list: {
					padding: 16,
				},
				card: {
					flexDirection: "row",
					alignItems: "center",
					backgroundColor: theme.surface,
					borderRadius,
					padding: 16,
					marginBottom: 12,
					gap: 16,
				},
				cardLocked: {
					opacity: 0.45,
				},
				iconContainer: {
					width: 48,
					height: 48,
					borderRadius: 24,
					backgroundColor: theme.onSurface,
					alignItems: "center",
					justifyContent: "center",
				},
				iconContainerUnlocked: {
					backgroundColor: theme.primaryAlpha33,
				},
				textContainer: {
					flex: 1,
				},
				unlockedDate: {
					marginTop: 2,
				},
			}),
		[theme]
	)

	const renderItem = useCallback(
		({ item }: { item: Achievement }) => (
			<AchievementCard item={item} styles={styles} />
		),
		[styles]
	)

	return (
		<View style={styles.container}>
			<Header title="Achievements" />
			<FlatList
				data={achievements}
				keyExtractor={(item) => item.id}
				contentContainerStyle={styles.list}
				renderItem={renderItem}
			/>
		</View>
	)
}
