import { router } from "expo-router"
import { useEffect } from "react"
import { View } from "react-native"

export default function NotFoundScreen() {
	// Send unknown paths through root route selection (onboarding vs tabs).
	useEffect(() => {
		setTimeout(() => {
			router.replace("/")
		}, 1)
	}, [])

	return <View></View>
}
