import { Injectable } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import type {
	SyncEntriesRequest,
	SyncEntriesResponse,
	SyncFavoritesRequest,
	RemoteDiaryEntry,
} from "@calorie-tracker/shared-types"

@Injectable()
export class DiaryService {
	constructor(private prisma: PrismaService) {}

	async syncEntries(
		userId: string,
		dto: SyncEntriesRequest
	): Promise<SyncEntriesResponse> {
		// Upsert all referenced foods first
		for (const food of dto.foods) {
			await this.prisma.food.upsert({
				where: { id: food.id },
				create: {
					id: food.id,
					name: food.name,
					brand: food.brand,
					isCustomEntry: food.isCustomEntry,
					isCustomFood: food.isCustomFood,
					servingQuantity: food.servingQuantity,
					energyPer100g: food.energyPer100g,
					proteinPer100g: food.proteinPer100g,
					carbsPer100g: food.carbsPer100g,
					fatPer100g: food.fatPer100g,
				},
				update: {
					name: food.name,
					brand: food.brand,
				},
			})
		}

		// Upsert diary entries
		let synced = 0
		for (const entry of dto.entries) {
			await this.prisma.diaryEntry.upsert({
				where: { userId_localId: { userId, localId: entry.localId } },
				create: {
					userId,
					localId: entry.localId,
					foodId: entry.foodId,
					quantity: entry.quantity,
					isServings: entry.isServings,
					date: entry.date,
					mealType: entry.mealType,
					kcalTotal: entry.kcalTotal,
					proteinTotal: entry.proteinTotal,
					carbsTotal: entry.carbsTotal,
					fatTotal: entry.fatTotal,
				},
				update: {
					quantity: entry.quantity,
					isServings: entry.isServings,
					mealType: entry.mealType,
					kcalTotal: entry.kcalTotal,
					proteinTotal: entry.proteinTotal,
					carbsTotal: entry.carbsTotal,
					fatTotal: entry.fatTotal,
					deletedAt: null,
				},
			})
			synced++
		}

		// Soft-delete removed entries
		let deleted = 0
		if (dto.deletedLocalIds?.length) {
			const result = await this.prisma.diaryEntry.updateMany({
				where: {
					userId,
					localId: { in: dto.deletedLocalIds },
					deletedAt: null,
				},
				data: { deletedAt: new Date() },
			})
			deleted = result.count
		}

		return { synced, deleted }
	}

	async deleteEntry(userId: string, localId: number): Promise<void> {
		await this.prisma.diaryEntry.updateMany({
			where: { userId, localId, deletedAt: null },
			data: { deletedAt: new Date() },
		})
	}

	async syncFavorites(
		userId: string,
		dto: SyncFavoritesRequest
	): Promise<void> {
		// Replace the user's favorites with the provided list
		await this.prisma.favoriteFood.deleteMany({ where: { userId } })
		if (dto.foodIds.length > 0) {
			await this.prisma.favoriteFood.createMany({
				data: dto.foodIds.map((foodId) => ({ userId, foodId })),
				skipDuplicates: true,
			})
		}
	}

	async pullEntries(
		userId: string,
		since?: string
	): Promise<RemoteDiaryEntry[]> {
		const entries = await this.prisma.diaryEntry.findMany({
			where: {
				userId,
				deletedAt: null,
				...(since ? { date: { gte: since } } : {}),
			},
			include: { food: true },
			orderBy: { date: "asc" },
		})

		return entries.map((e) => ({
			localId: e.localId,
			foodId: e.foodId,
			foodName: e.food.name,
			foodBrand: e.food.brand ?? undefined,
			isCustomEntry: e.food.isCustomEntry,
			isCustomFood: e.food.isCustomFood,
			servingQuantity: e.food.servingQuantity,
			energyPer100g: e.food.energyPer100g,
			proteinPer100g: e.food.proteinPer100g ?? undefined,
			carbsPer100g: e.food.carbsPer100g ?? undefined,
			fatPer100g: e.food.fatPer100g ?? undefined,
			quantity: e.quantity,
			isServings: e.isServings,
			date: e.date,
			mealType: e.mealType,
			kcalTotal: e.kcalTotal,
			proteinTotal: e.proteinTotal,
			carbsTotal: e.carbsTotal,
			fatTotal: e.fatTotal,
		}))
	}
}
