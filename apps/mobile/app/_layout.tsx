import { ThemeProvider } from "@react-navigation/native"
import { useFonts } from "expo-font"
import { Stack } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { StatusBar } from "expo-status-bar"
import { useEffect } from "react"
import * as NavigationBar from "expo-navigation-bar"
import { View } from "react-native"
import { CustomDarkTheme, CustomLightTheme } from "@/constants/Theme"
import { useResolvedColorScheme, useThemeColor } from "@/hooks/useThemeColor"
import { SafeAreaView } from "react-native-safe-area-context"
import { SelectionProvider } from "@/providers/SelectionProvider"
import * as SystemUI from "expo-system-ui"
import { DiaryProvider } from "@/providers/DatabaseProvider"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SettingsProvider, useSettings } from "@/providers/SettingsProvider"
import { AuthProvider } from "@/providers/AuthProvider"
import { SubscriptionProvider } from "@/providers/SubscriptionProvider"

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

function AppNavigator({ fontsLoaded }: { fontsLoaded: boolean }) {
	const theme = useThemeColor()
	const colorScheme = useResolvedColorScheme()
	const { settingsLoaded } = useSettings()

	useEffect(() => {
		if (fontsLoaded && settingsLoaded) {
			SplashScreen.hideAsync()
		}
	}, [fontsLoaded, settingsLoaded])

	return (
		<View style={{ flex: 1, backgroundColor: theme.background }}>
			<Stack
				screenOptions={{
					animation: "ios_from_right",
					animationDuration: 150,
				}}
			>
				<Stack.Screen name="index" options={{ headerShown: false }} />
				<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
				<Stack.Screen
					name="(onboarding)"
					options={{ headerShown: false }}
				/>
				<Stack.Screen
					name="+not-found"
					options={{ headerShown: false }}
				/>
				<Stack.Screen name="addFood" options={{ headerShown: false }} />
				<Stack.Screen
					name="foodInfo"
					options={{ headerShown: false }}
				/>
				<Stack.Screen
					name="searchFood"
					options={{
						headerShown: false,
						animation: "slide_from_bottom",
					}}
				/>
				<Stack.Screen
					name="barcodeScanner"
					options={{ headerShown: false }}
				/>
				<Stack.Screen name="meal" options={{ headerShown: false }} />
				<Stack.Screen
					name="photoLogger"
					options={{
						headerShown: false,
						animation: "slide_from_bottom",
					}}
				/>
				<Stack.Screen
					name="photoLogReview"
					options={{ headerShown: false }}
				/>
				<Stack.Screen
					name="paywall"
					options={{
						headerShown: false,
						animation: "slide_from_bottom",
					}}
				/>
			</Stack>
			<StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
		</View>
	)
}

function AppWithTheme({ fontsLoaded }: { fontsLoaded: boolean }) {
	const colorScheme = useResolvedColorScheme()
	const theme = useThemeColor()

	useEffect(() => {
		NavigationBar.setPositionAsync("relative")
		SystemUI.setBackgroundColorAsync(theme.background)
	}, [theme])

	return (
		<ThemeProvider
			value={colorScheme === "dark" ? CustomDarkTheme : CustomLightTheme}
		>
			<AuthProvider>
				<SubscriptionProvider>
					<GestureHandlerRootView>
						<DiaryProvider>
							<SelectionProvider>
								<SafeAreaView
									style={{
										flex: 1,
										backgroundColor: theme.background,
									}}
								>
									<AppNavigator fontsLoaded={fontsLoaded} />
								</SafeAreaView>
							</SelectionProvider>
						</DiaryProvider>
					</GestureHandlerRootView>
				</SubscriptionProvider>
			</AuthProvider>
		</ThemeProvider>
	)
}

export default function RootLayout() {
	const [loaded] = useFonts({
		SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
	})

	return (
		<SettingsProvider>
			<AppWithTheme fontsLoaded={loaded} />
		</SettingsProvider>
	)
}
