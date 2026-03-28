import * as Notifications from "expo-notifications"
import { Platform } from "react-native"

const REMINDER_NOTIFICATION_ID_KEY = "DAILY_REMINDER_ID"

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldShowBanner: true,
		shouldShowList: true,
		shouldPlaySound: false,
		shouldSetBadge: false,
	}),
})

export const requestNotificationPermissions =
	async (): Promise<boolean> => {
		const { status: existingStatus } =
			await Notifications.getPermissionsAsync()
		if (existingStatus === "granted") return true

		const { status } = await Notifications.requestPermissionsAsync()
		return status === "granted"
	}

export const scheduleDailyReminder = async (
	hour: number,
	minute: number
): Promise<boolean> => {
	const granted = await requestNotificationPermissions()
	if (!granted) return false

	// Cancel any existing reminder first
	await cancelDailyReminder()

	await Notifications.scheduleNotificationAsync({
		identifier: REMINDER_NOTIFICATION_ID_KEY,
		content: {
			title: "Time to log your meals! 🍽️",
			body: "Don't forget to track what you've eaten today.",
		},
		trigger: {
			type: Notifications.SchedulableTriggerInputTypes.DAILY,
			hour,
			minute,
		},
	})

	return true
}

export const cancelDailyReminder = async (): Promise<void> => {
	await Notifications.cancelScheduledNotificationAsync(
		REMINDER_NOTIFICATION_ID_KEY
	).catch(() => {})
}
