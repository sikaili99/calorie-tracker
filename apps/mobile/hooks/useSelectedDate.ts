import { useState, useCallback } from "react"

export const useSelectedDate = () => {
	const [selectedDate, setSelectedDate] = useState<Date>(() => new Date())

	const isToday = useCallback((date: Date): boolean => {
		const today = new Date()
		return (
			date.getFullYear() === today.getFullYear() &&
			date.getMonth() === today.getMonth() &&
			date.getDate() === today.getDate()
		)
	}, [])

	const goToNextDay = useCallback(() => {
		setSelectedDate((prev) => {
			const next = new Date(prev)
			next.setDate(next.getDate() + 1)
			return next
		})
	}, [])

	const goToPrevDay = useCallback(() => {
		setSelectedDate((prev) => {
			const prev2 = new Date(prev)
			prev2.setDate(prev2.getDate() - 1)
			return prev2
		})
	}, [])

	const goToDate = useCallback((date: Date) => {
		setSelectedDate(new Date(date))
	}, [])

	return {
		selectedDate,
		isToday: isToday(selectedDate),
		goToNextDay,
		goToPrevDay,
		goToDate,
	}
}
