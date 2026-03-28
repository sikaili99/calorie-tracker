import { Header } from "@/components/Header"
import { ThemedText } from "@/components/ThemedText"
import { useAchievements } from "@/hooks/useAchievements"
import { useStreak } from "@/hooks/useStreak"
import { useDatabase } from "@/hooks/useDatabase"
import { useThemeColor } from "@/hooks/useThemeColor"
import { borderRadius } from "@/constants/Theme"
import { UserStats } from "@/interfaces/Achievements"
import Ionicons from "@expo/vector-icons/Ionicons"
import React, { useMemo, useState, useEffect } from "react"
import { View, StyleSheet, FlatList } from "react-native"

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
					backgroundColor: theme.primary + "33",
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

	return (
		<View style={styles.container}>
			<Header title="Achievements" />
			<FlatList
				data={achievements}
				keyExtractor={(item) => item.id}
				contentContainerStyle={styles.list}
				renderItem={({ item }) => (
					<View
						style={[
							styles.card,
							!item.isUnlocked && styles.cardLocked,
						]}
					>
						<View
							style={[
								styles.iconContainer,
								item.isUnlocked &&
									styles.iconContainerUnlocked,
							]}
						>
							<Ionicons
								name={item.icon as any}
								size={24}
								color={
									item.isUnlocked
										? theme.primary
										: theme.text
								}
							/>
						</View>
						<View style={styles.textContainer}>
							<ThemedText type="defaultSemiBold">
								{item.title}
							</ThemedText>
							<ThemedText type="subtitleLight">
								{item.description}
							</ThemedText>
							{item.isUnlocked && item.unlockedAt && (
								<ThemedText
									type="subtitleLight"
									style={styles.unlockedDate}
									color={theme.primary}
								>
									Unlocked{" "}
									{new Date(
										item.unlockedAt
									).toLocaleDateString()}
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
					</View>
				)}
			/>
		</View>
	)
}
