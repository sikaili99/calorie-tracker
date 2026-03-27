export interface UserStats {
	totalEntries: number
	currentStreak: number
	longestStreak: number
	totalDaysLogged: number
	hasScannedBarcode: boolean
}

export interface Achievement {
	id: string
	title: string
	description: string
	icon: string // Ionicons name
	condition: (stats: UserStats) => boolean
}

export interface UnlockedAchievement {
	id: string
	unlockedAt: string // ISO date string
}

export const ACHIEVEMENTS: Achievement[] = [
	{
		id: "first_log",
		title: "First Step",
		description: "Log your first food entry",
		icon: "leaf-outline",
		condition: (s) => s.totalEntries >= 1,
	},
	{
		id: "ten_entries",
		title: "Getting Started",
		description: "Log 10 food entries",
		icon: "restaurant-outline",
		condition: (s) => s.totalEntries >= 10,
	},
	{
		id: "fifty_entries",
		title: "Dedicated",
		description: "Log 50 food entries",
		icon: "nutrition-outline",
		condition: (s) => s.totalEntries >= 50,
	},
	{
		id: "hundred_entries",
		title: "Century Club",
		description: "Log 100 food entries",
		icon: "trophy-outline",
		condition: (s) => s.totalEntries >= 100,
	},
	{
		id: "streak_3",
		title: "On a Roll",
		description: "Log food for 3 days in a row",
		icon: "flame-outline",
		condition: (s) => s.longestStreak >= 3,
	},
	{
		id: "streak_7",
		title: "Week Warrior",
		description: "Log food for 7 days in a row",
		icon: "flame",
		condition: (s) => s.longestStreak >= 7,
	},
	{
		id: "streak_30",
		title: "Habit Master",
		description: "Log food for 30 days in a row",
		icon: "star-outline",
		condition: (s) => s.longestStreak >= 30,
	},
	{
		id: "barcode_scan",
		title: "Scanner",
		description: "Add a food using the barcode scanner",
		icon: "barcode-outline",
		condition: (s) => s.hasScannedBarcode,
	},
]
