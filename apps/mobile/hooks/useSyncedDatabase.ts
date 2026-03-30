/**
 * Thin wrapper around useDatabase that fires pushPending after every write
 * so diary changes are synced to the backend in the background.
 */
import { useCallback } from "react"
import { useDatabase } from "./useDatabase"
import { useDiarySync } from "./useDiarySync"
import type { NewDiaryEntry, UpdateDiaryEntry } from "./useDatabase"

export const useSyncedDatabase = () => {
	const db = useDatabase()
	const { pushPending } = useDiarySync()

	const addDiaryEntry = useCallback(
		async (entry: NewDiaryEntry) => {
			await db.addDiaryEntry(entry)
			pushPending().catch(() => {})
		},
		[db, pushPending]
	)

	const updateDiaryEntry = useCallback(
		async (entry: UpdateDiaryEntry) => {
			await db.updateDiaryEntry(entry)
			pushPending().catch(() => {})
		},
		[db, pushPending]
	)

	const deleteDiaryEntry = useCallback(
		async (id: number) => {
			await db.deleteDiaryEntry(id)
			pushPending().catch(() => {})
		},
		[db, pushPending]
	)

	const addFavoriteFood = useCallback(
		async (food: Parameters<typeof db.addFavoriteFood>[0]) => {
			await db.addFavoriteFood(food)
			pushPending().catch(() => {})
		},
		[db, pushPending]
	)

	const deleteFavoriteFood = useCallback(
		async (foodId: string) => {
			await db.deleteFavoriteFood(foodId)
			pushPending().catch(() => {})
		},
		[db, pushPending]
	)

	return {
		...db,
		addDiaryEntry,
		updateDiaryEntry,
		deleteDiaryEntry,
		addFavoriteFood,
		deleteFavoriteFood,
	}
}
