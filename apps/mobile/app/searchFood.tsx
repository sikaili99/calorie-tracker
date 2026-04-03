import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react"
import {
	View,
	TextInput,
	Keyboard,
	FlatList,
	StyleSheet,
	ScrollView,
	Dimensions,
	ActivityIndicator,
} from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import { useThemeColor } from "@/hooks/useThemeColor"
import useNavigationBarColor from "@/hooks/useNavigationBarColor"
import { SelectionContext } from "@/providers/SelectionProvider"
import { FoodSearchCard } from "@/components/FoodSearchCard"
import { useSearchFood } from "@/hooks/useSearchFood"
import { Food } from "@/hooks/useDatabase"
import { borderRadius } from "@/constants/Theme"
import { TabSelector } from "@/components/searchFoodPage/TabSelector"
import { SearchBar } from "@/components/searchFoodPage/SearchBar"
import { ThemedText } from "@/components/ThemedText"
import { CustomPressable } from "@/components/CustomPressable"
import { useSubscription } from "@/providers/SubscriptionProvider"
import Ionicons from "@expo/vector-icons/Ionicons"

const foodCategoryTabs = ["generic", "branded", "ai"] as const
type FoodCategoryTab = (typeof foodCategoryTabs)[number]

export default function SearchFood() {
	const theme = useThemeColor()
	const { branded, generic, ai, handleSearch } = useSearchFood()
	const { isPremium } = useSubscription()

	const windowWidth = useMemo(() => Dimensions.get("window").width, [])

	const styles = useMemo(
		() =>
			StyleSheet.create({
				mainContainer: {
					flex: 1,
					backgroundColor: theme.background,
					alignItems: "center",
					justifyContent: "flex-start",
				},
				topContainer: {
					width: "100%",
					flexDirection: "column",
					backgroundColor: theme.surface,
					paddingTop: 16,
				},
				foodListContainer: {
					width: windowWidth + 1,
					marginTop: 16,
					paddingHorizontal: 16,
					paddingBottom: 32,
				},
				loading: {
					flex: 1,
					justifyContent: "center",
					alignItems: "center",
					paddingTop: 48,
				},
				aiHint: {
					paddingHorizontal: 4,
					paddingVertical: 8,
					marginBottom: 8,
				},
				lockContainer: {
					alignItems: "center",
					justifyContent: "center",
					paddingTop: 64,
					gap: 12,
					paddingHorizontal: 16,
				},
				unlockButton: {
					backgroundColor: theme.primary,
					paddingVertical: 14,
					paddingHorizontal: 28,
					borderRadius,
					alignItems: "center",
					marginTop: 8,
				},
			}),
		[theme, windowWidth]
	)

	const textInputRef = useRef<TextInput>(null)
	const { goBack } = useLocalSearchParams()
	const { setFood } = useContext(SelectionContext)
	const [selectedTab, setSelectedTab] =
		useState<FoodCategoryTab>("generic")
	const [searchQuery, setSearchQuery] = useState("")

	useNavigationBarColor(theme.background)

	useEffect(() => {
		const subscription = Keyboard.addListener("keyboardDidHide", () => {
			textInputRef.current?.blur()
		})
		return () => subscription.remove()
	}, [])

	useEffect(() => {
		if (goBack === "true") {
			router.back()
		}
	}, [goBack])

	const handleSearchType = useCallback(() => {
		const trimmedQuery = searchQuery.trim()
		if (selectedTab === "generic" && generic.lastQuery === trimmedQuery)
			return
		if (selectedTab === "branded" && branded.lastQuery === trimmedQuery)
			return
		if (selectedTab === "ai" && ai.lastQuery === trimmedQuery) return
		handleSearch(selectedTab, trimmedQuery)
	}, [handleSearch, selectedTab, searchQuery, generic, branded, ai])

	useEffect(() => {
		handleSearchType()
	}, [selectedTab])

	const handleTapFood = useCallback(
		(food: Food) => {
			setFood(food)
			router.push({ pathname: "/foodInfo" })
		},
		[setFood]
	)

	const scrollViewRef = useRef<ScrollView>(null)

	useEffect(() => {
		if (scrollViewRef.current) {
			const tabIndex = foodCategoryTabs.indexOf(selectedTab)
			scrollViewRef.current.scrollTo({
				x: tabIndex * windowWidth,
				animated: true,
			})
		}
	}, [selectedTab, windowWidth])

	const handleRequestFocus = useCallback(() => {
		textInputRef.current?.focus()
	}, [])

	const getTabState = (tab: FoodCategoryTab) => {
		if (tab === "generic") return generic
		if (tab === "branded") return branded
		return { ...ai, isError: !!ai.error }
	}

	return (
		<View style={styles.mainContainer}>
			<View style={styles.topContainer}>
				<SearchBar
					ref={textInputRef}
					value={searchQuery}
					onRequestFocus={handleRequestFocus}
					onChangeText={setSearchQuery}
					onSubmit={handleSearchType}
					onClear={() => {
						textInputRef.current?.clear()
						setSearchQuery("")
					}}
				/>
				<TabSelector
					tabs={foodCategoryTabs}
					selectedTab={selectedTab}
					onTabChange={setSelectedTab}
				/>
			</View>
			<ScrollView
				ref={scrollViewRef}
				contentContainerStyle={{ flexGrow: 1 }}
				horizontal
				showsHorizontalScrollIndicator={false}
				pagingEnabled
				scrollEnabled={false}
			>
				{foodCategoryTabs.map((tab) => {
					const state = getTabState(tab)

					if (tab === "ai" && !isPremium) {
						return (
							<View
								key={tab}
								style={[
									styles.foodListContainer,
									styles.lockContainer,
								]}
							>
								<Ionicons
									name="lock-closed-outline"
									size={40}
									color={theme.primary}
								/>
								<ThemedText type="defaultSemiBold" centered>
									Premium Feature
								</ThemedText>
								<ThemedText type="subtitleLight" centered>
									Describe meals in plain language and let AI
									find them for you.
								</ThemedText>
								<CustomPressable
									borderRadius={borderRadius}
									style={styles.unlockButton}
									onPress={() =>
										router.push({
											pathname: "/paywall",
											params: {
												featureName: "AI Food Search",
											},
										})
									}
								>
										<ThemedText
											type="defaultSemiBold"
											color={theme.background}
										>
											Start Free Trial
										</ThemedText>
									</CustomPressable>
							</View>
						)
					}

					return (
						<View key={tab} style={styles.foodListContainer}>
							{tab === "ai" && !state.lastQuery && (
								<View style={styles.aiHint}>
									<ThemedText type="subtitleLight">
										Describe what you ate in plain
										language.{"\n"}e.g. "grilled chicken
										with rice and broccoli"
									</ThemedText>
								</View>
							)}
							{state.isLoading ? (
								<View style={styles.loading}>
									<ActivityIndicator
										color={theme.primary}
										size="large"
									/>
									{tab === "ai" && (
										<ThemedText
											type="subtitleLight"
											style={{ marginTop: 12 }}
										>
											Parsing your description…
										</ThemedText>
									)}
								</View>
							) : state.error ? (
								<ThemedText>{state.error}</ThemedText>
							) : state.lastQuery ? (
								<FlatList
									showsVerticalScrollIndicator={false}
									data={state.data}
									keyExtractor={(item) =>
										item.id!.toString()
									}
									renderItem={({ item }) => (
										<FoodSearchCard
											food={item}
											onTap={() => handleTapFood(item)}
										/>
									)}
								/>
							) : null}
						</View>
					)
				})}
			</ScrollView>
		</View>
	)
}
