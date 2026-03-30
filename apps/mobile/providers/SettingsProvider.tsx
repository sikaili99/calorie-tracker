import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react"
import * as Crypto from "expo-crypto"
import AsyncStorage from "@react-native-async-storage/async-storage"
import {
	scheduleDailyReminder,
	cancelDailyReminder,
} from "@/utils/notifications"
import { ActivityLevel, GoalType } from "@/utils/tdee"

export interface UserProfile {
	userName?: string
	userAge?: number
	userWeightKg?: number
	userHeightCm?: number
	activityLevel?: ActivityLevel
	goalType?: GoalType
}

interface SettingsContextProps {
	targetCalories: number | undefined
	targetCarbsPercentage: number | undefined
	targetProteinPercentage: number | undefined
	targetFatPercentage: number | undefined
	usdaApiKey: string | undefined
	userUuid: string | undefined
	notificationsEnabled: boolean
	reminderHour: number
	reminderMinute: number
	onboardingComplete: boolean
	settingsLoaded: boolean
	userName: string | undefined
	userAge: number | undefined
	userWeightKg: number | undefined
	userHeightCm: number | undefined
	activityLevel: ActivityLevel | undefined
	goalType: GoalType | undefined
	isPremium: boolean
	updateTargetCalories: (value: number) => void
	updateTargetCarbsPercentage: (value: number) => void
	updateTargetProteinPercentage: (value: number) => void
	updateTargetFatPercentage: (value: number) => void
	updateUsdaApiKey: (value?: string) => void
	updateNotificationsEnabled: (value: boolean) => void
	updateReminderTime: (hour: number, minute: number) => void
	updateOnboardingComplete: (value: boolean) => Promise<void>
	updateIsPremium: (value: boolean) => Promise<void>
	updateUserProfile: (profile: UserProfile) => Promise<void>
}

const SettingsContext = createContext<SettingsContextProps | undefined>(
	undefined
)

export const SettingsProvider: React.FC<React.PropsWithChildren> = ({
	children,
}) => {
	const [settings, setSettings] = useState<{
		targetCalories: number | undefined
		targetCarbsPercentage: number | undefined
		targetProteinPercentage: number | undefined
		targetFatPercentage: number | undefined
		usdaApiKey: string | undefined
		userUuid: string | undefined
		notificationsEnabled: boolean
		reminderHour: number
		reminderMinute: number
		onboardingComplete: boolean
		settingsLoaded: boolean
		userName: string | undefined
		userAge: number | undefined
		userWeightKg: number | undefined
		userHeightCm: number | undefined
		activityLevel: ActivityLevel | undefined
		goalType: GoalType | undefined
		isPremium: boolean
	}>({
		targetCalories: undefined,
		targetCarbsPercentage: undefined,
		targetProteinPercentage: undefined,
		targetFatPercentage: undefined,
		usdaApiKey: undefined,
		userUuid: undefined,
		notificationsEnabled: false,
		reminderHour: 20,
		reminderMinute: 0,
		onboardingComplete: false,
		settingsLoaded: false,
		userName: undefined,
		userAge: undefined,
		userWeightKg: undefined,
		userHeightCm: undefined,
		activityLevel: undefined,
		goalType: undefined,
		isPremium: false,
	})

	const getStoredSetting = useCallback(
		async <T,>(key: string, defaultValue: T): Promise<T> => {
			const stored = await AsyncStorage.getItem(key)
			return stored ? (JSON.parse(stored) as T) : defaultValue
		},
		[]
	)

	const updateSetting = useCallback(
		async (
			key: string,
			field: keyof typeof settings,
			value?: number | string | boolean
		) => {
			await AsyncStorage.setItem(key, JSON.stringify(value))
			setSettings((prev) => ({ ...prev, [field]: value }))
		},
		[]
	)

	useEffect(() => {
		const loadSettings = async () => {
			const targetCalories = await getStoredSetting(
				"TARGET_CALORIES",
				2200
			)
			const targetCarbsPercentage = await getStoredSetting(
				"TARGET_CARBS_PERCENTAGE",
				50
			)
			const targetProteinPercentage = await getStoredSetting(
				"TARGET_PROTEIN_PERCENTAGE",
				25
			)
			const targetFatPercentage = await getStoredSetting(
				"TARGET_FAT_PERCENTAGE",
				25
			)
			const usdaApiKey = await getStoredSetting("USDA_API_KEY", "")
			let userUuid = await getStoredSetting("USER_UUID", "")
			if (!userUuid) {
				const uuid = Crypto.randomUUID()
				await AsyncStorage.setItem("USER_UUID", JSON.stringify(uuid))
				userUuid = uuid
			}
			const notificationsEnabledRaw = await getStoredSetting<
				boolean | number
			>("NOTIFICATIONS_ENABLED", false)
			const notificationsEnabled = Boolean(notificationsEnabledRaw)
			const reminderHour = await getStoredSetting("REMINDER_HOUR", 20)
			const reminderMinute = await getStoredSetting(
				"REMINDER_MINUTE",
				0
			)
			const onboardingComplete = await getStoredSetting(
				"ONBOARDING_COMPLETE",
				false
			)
			const isPremiumRaw = await getStoredSetting<boolean | number>(
				"IS_PREMIUM",
				false
			)
			const isPremium = Boolean(isPremiumRaw)
			const userName = await getStoredSetting<string | undefined>(
				"USER_NAME",
				undefined
			)
			const userAge = await getStoredSetting<number | undefined>(
				"USER_AGE",
				undefined
			)
			const userWeightKg = await getStoredSetting<number | undefined>(
				"USER_WEIGHT_KG",
				undefined
			)
			const userHeightCm = await getStoredSetting<number | undefined>(
				"USER_HEIGHT_CM",
				undefined
			)
			const activityLevel = await getStoredSetting<
				ActivityLevel | undefined
			>("ACTIVITY_LEVEL", undefined)
			const goalType = await getStoredSetting<GoalType | undefined>(
				"GOAL_TYPE",
				undefined
			)
			setSettings({
				targetCalories,
				targetCarbsPercentage,
				targetProteinPercentage,
				targetFatPercentage,
				usdaApiKey,
				userUuid,
				notificationsEnabled,
				reminderHour,
				reminderMinute,
				onboardingComplete,
				settingsLoaded: true,
				userName,
				userAge,
				userWeightKg,
				userHeightCm,
				activityLevel,
				goalType,
				isPremium,
			})
		}

		loadSettings()
	}, [getStoredSetting])

	const updateNotificationsEnabled = useCallback(
		async (value: boolean) => {
			await updateSetting(
				"NOTIFICATIONS_ENABLED",
				"notificationsEnabled",
				value
			)
			if (!value) {
				await cancelDailyReminder()
			} else {
				const hour = settings.reminderHour ?? 20
				const minute = settings.reminderMinute ?? 0
				await scheduleDailyReminder(hour, minute)
			}
		},
		[updateSetting, settings.reminderHour, settings.reminderMinute]
	)

	const updateReminderTime = useCallback(
		async (hour: number, minute: number) => {
			await AsyncStorage.setItem("REMINDER_HOUR", JSON.stringify(hour))
			await AsyncStorage.setItem(
				"REMINDER_MINUTE",
				JSON.stringify(minute)
			)
			setSettings((prev) => ({
				...prev,
				reminderHour: hour,
				reminderMinute: minute,
			}))
			if (settings.notificationsEnabled) {
				await scheduleDailyReminder(hour, minute)
			}
		},
		[settings.notificationsEnabled]
	)

	const updateOnboardingComplete = useCallback(
		async (value: boolean) => {
			await AsyncStorage.setItem(
				"ONBOARDING_COMPLETE",
				JSON.stringify(value)
			)
			setSettings((prev) => ({ ...prev, onboardingComplete: value }))
		},
		[]
	)

	const updateIsPremium = useCallback(async (value: boolean) => {
		await AsyncStorage.setItem("IS_PREMIUM", JSON.stringify(value))
		setSettings((prev) => ({ ...prev, isPremium: value }))
	}, [])

	const updateUserProfile = useCallback(async (profile: UserProfile) => {
		const entries: [string, string, keyof typeof settings][] = [
			["USER_NAME", JSON.stringify(profile.userName), "userName"],
			["USER_AGE", JSON.stringify(profile.userAge), "userAge"],
			[
				"USER_WEIGHT_KG",
				JSON.stringify(profile.userWeightKg),
				"userWeightKg",
			],
			[
				"USER_HEIGHT_CM",
				JSON.stringify(profile.userHeightCm),
				"userHeightCm",
			],
			[
				"ACTIVITY_LEVEL",
				JSON.stringify(profile.activityLevel),
				"activityLevel",
			],
			["GOAL_TYPE", JSON.stringify(profile.goalType), "goalType"],
		].filter(([, v]) => v !== "undefined") as [
			string,
			string,
			keyof typeof settings,
		][]

		await Promise.all(
			entries.map(([key, value]) => AsyncStorage.setItem(key, value))
		)
		setSettings((prev) => ({ ...prev, ...profile }))
	}, [])

	const contextValue = useMemo(
		() => ({
			...settings,
			updateTargetCalories: (value: number) =>
				updateSetting("TARGET_CALORIES", "targetCalories", value),
			updateTargetCarbsPercentage: (value: number) =>
				updateSetting(
					"TARGET_CARBS_PERCENTAGE",
					"targetCarbsPercentage",
					value
				),
			updateTargetProteinPercentage: (value: number) =>
				updateSetting(
					"TARGET_PROTEIN_PERCENTAGE",
					"targetProteinPercentage",
					value
				),
			updateTargetFatPercentage: (value: number) =>
				updateSetting(
					"TARGET_FAT_PERCENTAGE",
					"targetFatPercentage",
					value
				),
			updateUsdaApiKey: (value?: string) =>
				updateSetting("USDA_API_KEY", "usdaApiKey", value),
			updateNotificationsEnabled,
			updateReminderTime,
			updateOnboardingComplete,
			updateIsPremium,
			updateUserProfile,
		}),
		[
			settings,
			updateSetting,
			updateNotificationsEnabled,
			updateReminderTime,
			updateOnboardingComplete,
			updateIsPremium,
			updateUserProfile,
		]
	)

	return (
		<SettingsContext.Provider value={contextValue}>
			{children}
		</SettingsContext.Provider>
	)
}

export const useSettings = (): SettingsContextProps => {
	const context = useContext(SettingsContext)
	if (!context) {
		throw new Error("useSettings must be used within a SettingsProvider")
	}
	return context
}
