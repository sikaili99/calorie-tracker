import { useCallback } from "react"
import { useDiaryContext } from "@/providers/DatabaseProvider"
import { useAuth } from "@/providers/AuthProvider"
import { BackendAPI } from "@/api/BackendAPI"
import type { SyncFoodDto, SyncDiaryEntryDto } from "@calorie-tracker/shared-types"

type RawRow = {
	id: number
	quantity: number
	is_servings: number
	date: string
	meal_type: number
	kcal_total: number
	protein_total: number
	carbs_total: number
	fat_total: number
	food_id: string
	food_name: string
	food_brand: string | null
	food_is_custom_entry: number
	food_is_custom_food: number
	food_serving_quantity: number
	food_energy_100g: number
	food_protein_100g: number | null
	food_carbs_100g: number | null
	food_fat_100g: number | null
}

export const useDiarySync = () => {
	const { db } = useDiaryContext()
	const { isAuthenticated } = useAuth()

	const pushPending = useCallback(async () => {
		if (!db || !isAuthenticated) return

		const rows = (await db.getAllAsync(
			`SELECT de.id, de.quantity, de.is_servings, de.date, de.meal_type,
			        de.kcal_total, de.protein_total, de.carbs_total, de.fat_total,
			        de.food_id,
			        f.name AS food_name, f.brand AS food_brand,
			        f.is_custom_entry AS food_is_custom_entry,
			        f.is_custom_food AS food_is_custom_food,
			        f.serving_quantity AS food_serving_quantity,
			        f.energy_100g AS food_energy_100g,
			        f.protein_100g AS food_protein_100g,
			        f.carbs_100g AS food_carbs_100g,
			        f.fat_100g AS food_fat_100g
			 FROM diary_entries de
			 JOIN food f ON de.food_id = f.id
			 WHERE de.synced_at IS NULL`
		)) as RawRow[]

		if (rows.length === 0) return

		const foodMap = new Map<string, SyncFoodDto>()
		const entries: SyncDiaryEntryDto[] = []

		for (const row of rows) {
			if (!foodMap.has(row.food_id)) {
				foodMap.set(row.food_id, {
					id: row.food_id,
					name: row.food_name,
					brand: row.food_brand ?? undefined,
					isCustomEntry: row.food_is_custom_entry === 1,
					isCustomFood: row.food_is_custom_food === 1,
					servingQuantity: row.food_serving_quantity,
					energyPer100g: row.food_energy_100g,
					proteinPer100g: row.food_protein_100g ?? undefined,
					carbsPer100g: row.food_carbs_100g ?? undefined,
					fatPer100g: row.food_fat_100g ?? undefined,
				})
			}
			entries.push({
				localId: row.id,
				foodId: row.food_id,
				quantity: row.quantity,
				isServings: row.is_servings === 1,
				date: row.date,
				mealType: row.meal_type,
				kcalTotal: row.kcal_total,
				proteinTotal: row.protein_total,
				carbsTotal: row.carbs_total,
				fatTotal: row.fat_total,
			})
		}

		await BackendAPI.syncDiaryEntries({
			foods: Array.from(foodMap.values()),
			entries,
		})

		const ids = rows.map((r) => r.id)
		const placeholders = ids.map(() => "?").join(",")
		await db.runAsync(
			`UPDATE diary_entries SET synced_at = ? WHERE id IN (${placeholders})`,
			[new Date().toISOString(), ...ids]
		)
	}, [db, isAuthenticated])

	const pullAll = useCallback(
		async (since?: string) => {
			if (!db || !isAuthenticated) return

			const remoteEntries = await BackendAPI.pullDiaryEntries(since)
			if (remoteEntries.length === 0) return

			for (const entry of remoteEntries) {
				// Upsert food
				await db.runAsync(
					`INSERT OR IGNORE INTO food
					 (id, name, brand, is_custom_entry, is_custom_food,
					  serving_quantity, energy_100g, protein_100g, carbs_100g, fat_100g)
					 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
					[
						entry.foodId,
						entry.foodName,
						entry.foodBrand ?? null,
						entry.isCustomEntry ? 1 : 0,
						entry.isCustomFood ? 1 : 0,
						entry.servingQuantity,
						entry.energyPer100g,
						entry.proteinPer100g ?? null,
						entry.carbsPer100g ?? null,
						entry.fatPer100g ?? null,
					]
				)
				// Upsert diary entry — use localId as the SQLite id
				await db.runAsync(
					`INSERT OR IGNORE INTO diary_entries
					 (id, food_id, quantity, is_servings, date, meal_type,
					  kcal_total, protein_total, carbs_total, fat_total, synced_at)
					 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
					[
						entry.localId,
						entry.foodId,
						entry.quantity,
						entry.isServings ? 1 : 0,
						entry.date,
						entry.mealType,
						entry.kcalTotal,
						entry.proteinTotal,
						entry.carbsTotal,
						entry.fatTotal,
						new Date().toISOString(),
					]
				)
			}
		},
		[db, isAuthenticated]
	)

	return { pushPending, pullAll }
}
