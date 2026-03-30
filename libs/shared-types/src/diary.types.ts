export interface SyncFoodDto {
	id: string
	name: string
	brand?: string
	isCustomEntry: boolean
	isCustomFood: boolean
	servingQuantity: number
	energyPer100g: number
	proteinPer100g?: number
	carbsPer100g?: number
	fatPer100g?: number
}

export interface SyncDiaryEntryDto {
	localId: number
	foodId: string
	quantity: number
	isServings: boolean
	date: string
	mealType: number
	kcalTotal: number
	proteinTotal: number
	carbsTotal: number
	fatTotal: number
}

export interface SyncEntriesRequest {
	foods: SyncFoodDto[]
	entries: SyncDiaryEntryDto[]
	deletedLocalIds?: number[]
}

export interface SyncEntriesResponse {
	synced: number
	deleted: number
}

export interface SyncFavoritesRequest {
	foodIds: string[]
}

export interface RemoteDiaryEntry {
	localId: number
	foodId: string
	foodName: string
	foodBrand?: string
	isCustomEntry: boolean
	isCustomFood: boolean
	servingQuantity: number
	energyPer100g: number
	proteinPer100g?: number
	carbsPer100g?: number
	fatPer100g?: number
	quantity: number
	isServings: boolean
	date: string
	mealType: number
	kcalTotal: number
	proteinTotal: number
	carbsTotal: number
	fatTotal: number
}
