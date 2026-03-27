export interface WeeklyReport {
	weekSummary: string
	macroAnalysis: string
	topFoods: string[]
	patterns: string[]
	recommendations: string[]
	generatedAt: string // ISO date string
	weekStartDate: string // YYYY-MM-DD
}
