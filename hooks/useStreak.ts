import { useState, useEffect, useCallback } from "react"
import { useDatabase } from "./useDatabase"
import { ISODateString } from "./useDatabase"

interface StreakData {
	currentStreak: number
	longestStreak: number
	lastLoggedDate: ISODateString | null
}

function computeStreaks(dates: ISODateString[]): StreakData {
	if (dates.length === 0) {
		return { currentStreak: 0, longestStreak: 0, lastLoggedDate: null }
	}

	// dates are sorted DESC from DB
	const sorted = [...dates].sort().reverse() // keep DESC order
	const lastLoggedDate = sorted[0]

	// Check if the streak is still active (last log was today or yesterday)
	const today = new Date()
	today.setHours(0, 0, 0, 0)
	const lastDate = new Date(sorted[0])
	lastDate.setHours(0, 0, 0, 0)
	const daysSinceLast = Math.floor(
		(today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
	)

	// Build a Set for O(1) lookups
	const dateSet = new Set(sorted)

	// Compute current streak
	let currentStreak = 0
	if (daysSinceLast <= 1) {
		// Start from today or yesterday depending on last log
		const startDate = new Date(today)
		if (daysSinceLast === 1) {
			startDate.setDate(startDate.getDate() - 1)
		}
		let checkDate = new Date(startDate)
		while (true) {
			const key = checkDate.toISOString().split("T")[0] as ISODateString
			if (dateSet.has(key)) {
				currentStreak++
				checkDate.setDate(checkDate.getDate() - 1)
			} else {
				break
			}
		}
	}

	// Compute longest streak
	let longestStreak = 0
	let runStreak = 1
	const asc = [...sorted].reverse() // oldest first
	for (let i = 1; i < asc.length; i++) {
		const prev = new Date(asc[i - 1])
		const curr = new Date(asc[i])
		const diff = Math.floor(
			(curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
		)
		if (diff === 1) {
			runStreak++
		} else {
			longestStreak = Math.max(longestStreak, runStreak)
			runStreak = 1
		}
	}
	longestStreak = Math.max(longestStreak, runStreak)

	return { currentStreak, longestStreak, lastLoggedDate }
}

export const useStreak = () => {
	const { fetchStreakData } = useDatabase()
	const [streakData, setStreakData] = useState<StreakData>({
		currentStreak: 0,
		longestStreak: 0,
		lastLoggedDate: null,
	})

	const refresh = useCallback(async () => {
		try {
			const dates = await fetchStreakData()
			setStreakData(computeStreaks(dates))
		} catch (e) {
			console.error("useStreak: failed to fetch streak data", e)
		}
	}, [fetchStreakData])

	useEffect(() => {
		refresh()
	}, [refresh])

	return { ...streakData, refresh }
}
