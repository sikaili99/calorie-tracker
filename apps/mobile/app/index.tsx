import { Redirect } from "expo-router"
import { View } from "react-native"
import { useSettings } from "@/providers/SettingsProvider"

export default function Index() {
	const { onboardingComplete, settingsLoaded } = useSettings()
	if (!settingsLoaded) return <View style={{ flex: 1 }} />
	if (!onboardingComplete) return <Redirect href="/(onboarding)" />
	return <Redirect href="/(tabs)" />
}
