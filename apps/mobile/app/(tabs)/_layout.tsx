import { Tabs, router } from "expo-router"
import Ionicons from "@expo/vector-icons/Ionicons"
import * as Haptics from "expo-haptics"
import { useThemeColor } from "@/hooks/useThemeColor"
import { useEffect, useMemo } from "react"
import { StyleSheet, View } from "react-native"
import { useSettings } from "@/providers/SettingsProvider"

export default function TabLayout() {
	const theme = useThemeColor()
	const { onboardingComplete, settingsLoaded } = useSettings()

	useEffect(() => {
		if (settingsLoaded && !onboardingComplete) {
			router.replace("/(onboarding)")
		}
	}, [settingsLoaded, onboardingComplete])

	if (!settingsLoaded || !onboardingComplete) return <View style={{ flex: 1 }} />
	const handleTabPress = () => {
		// TODO add a setting to enable/disable haptics
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
	}

	const styles = useMemo(
		() =>
			StyleSheet.create({
				label: {
					fontSize: 12,
					fontWeight: "bold",
				},
			}),
		[theme]
	)

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: theme.primary,
				tabBarStyle: {
					backgroundColor: theme.bottomNav,
				},
			}}
		>
			<Tabs.Screen
				name="diary"
				listeners={{
					tabPress: handleTabPress,
				}}
				options={{
					title: "Diary",
					headerShown: false,
					tabBarLabelStyle: styles.label,
					tabBarButtonTestID: "tab-diary",
					tabBarIcon: ({ color, focused }) => (
						<Ionicons
							name={focused ? "book" : "book-outline"}
							color={color}
							size={24}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="coach"
				listeners={{
					tabPress: handleTabPress,
				}}
				options={{
					title: "Coach",
					headerShown: false,
					tabBarLabelStyle: styles.label,
					tabBarButtonTestID: "tab-coach",
					tabBarIcon: ({ color, focused }) => (
						<Ionicons
							name={
								focused
									? "chatbubble-ellipses"
									: "chatbubble-ellipses-outline"
							}
							color={color}
							size={24}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="achievements"
				listeners={{
					tabPress: handleTabPress,
				}}
				options={{
					title: "Achievements",
					headerShown: false,
					tabBarLabelStyle: styles.label,
					tabBarButtonTestID: "tab-achievements",
					tabBarIcon: ({ color, focused }) => (
						<Ionicons
							name={focused ? "trophy" : "trophy-outline"}
							color={color}
							size={24}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="history"
				listeners={{
					tabPress: handleTabPress,
				}}
				options={{
					title: "History",
					headerShown: false,
					tabBarLabelStyle: styles.label,
					tabBarButtonTestID: "tab-history",
					tabBarIcon: ({ color, focused }) => (
						<Ionicons
							name={focused ? "calendar" : "calendar-outline"}
							color={color}
							size={24}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="settings"
				listeners={{
					tabPress: handleTabPress,
				}}
				options={{
					title: "Settings",
					headerShown: false,
					tabBarLabelStyle: styles.label,
					tabBarButtonTestID: "tab-settings",
					tabBarIcon: ({ color, focused }) => (
						<Ionicons
							name={focused ? "settings" : "settings-outline"}
							color={color}
							size={24}
						/>
					),
				}}
			/>
		</Tabs>
	)
}
