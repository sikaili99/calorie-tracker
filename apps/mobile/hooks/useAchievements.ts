import { useState, useEffect, useCallback } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import {
	ACHIEVEMENTS,
	Achievement,
	UnlockedAchievement,
	UserStats,
} from "@/interfaces/Achievements"
import { useDatabase } from "./useDatabase"

const STORAGE_KEY = "UNLOCKED_ACHIEVEMENTS"

export const useAchievements = (stats: UserStats) => {
	const [unlocked, setUnlocked] = useState<UnlockedAchievement[]>([])

	const load = useCallback(async () => {
		try {
			const stored = await AsyncStorage.getItem(STORAGE_KEY)
			if (stored) {
				setUnlocked(JSON.parse(stored) as UnlockedAchievement[])
			}
		} catch (e) {
			console.error("useAchievements: failed to load", e)
		}
	}, [])

	const checkAndUnlock = useCallback(
		async (currentStats: UserStats) => {
			try {
				const stored = await AsyncStorage.getItem(STORAGE_KEY)
				const existing: UnlockedAchievement[] = stored
					? JSON.parse(stored)
					: []
				const existingIds = new Set(existing.map((u) => u.id))

				const newlyUnlocked: UnlockedAchievement[] = []
				for (const achievement of ACHIEVEMENTS) {
					if (
						!existingIds.has(achievement.id) &&
						achievement.condition(currentStats)
					) {
						newlyUnlocked.push({
							id: achievement.id,
							unlockedAt: new Date().toISOString(),
						})
					}
				}

				if (newlyUnlocked.length > 0) {
					const updated = [...existing, ...newlyUnlocked]
					await AsyncStorage.setItem(
						STORAGE_KEY,
						JSON.stringify(updated)
					)
					setUnlocked(updated)
				}
			} catch (e) {
				console.error("useAchievements: failed to check/unlock", e)
			}
		},
		[]
	)

	useEffect(() => {
		load()
	}, [load])

	useEffect(() => {
		if (stats.totalEntries > 0 || stats.currentStreak > 0) {
			checkAndUnlock(stats)
		}
	}, [stats, checkAndUnlock])

	const unlockedIds = new Set(unlocked.map((u) => u.id))

	const achievementsWithStatus = ACHIEVEMENTS.map((a) => ({
		...a,
		isUnlocked: unlockedIds.has(a.id),
		unlockedAt: unlocked.find((u) => u.id === a.id)?.unlockedAt ?? null,
	}))

	return { achievements: achievementsWithStatus }
}
