import { Stack } from "expo-router"

export default function OnboardingLayout() {
	return (
		<Stack screenOptions={{ headerShown: false }} initialRouteName="welcome">
			<Stack.Screen name="welcome" />
			<Stack.Screen name="auth-choice" />
			<Stack.Screen name="register" />
			<Stack.Screen name="login" />
			<Stack.Screen name="goal-wizard" />
		</Stack>
	)
}
