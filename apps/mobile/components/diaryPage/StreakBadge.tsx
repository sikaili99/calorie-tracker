import { View, StyleSheet, TouchableOpacity } from "react-native"
import { ThemedText } from "@/components/ThemedText"
import { useThemeColor } from "@/hooks/useThemeColor"
import { useRouter } from "expo-router"

interface StreakBadgeProps {
	streak: number
}

export const StreakBadge = ({ streak }: StreakBadgeProps) => {
	const theme = useThemeColor()
	const router = useRouter()

	if (streak === 0) return null

	return (
		<TouchableOpacity
			onPress={() => router.push("/(tabs)/achievements")}
			style={[styles.badge, { backgroundColor: theme.surface }]}
			hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
		>
			<ThemedText type="subtitleBold">🔥 {streak}</ThemedText>
		</TouchableOpacity>
	)
}

const styles = StyleSheet.create({
	badge: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 12,
		gap: 4,
	},
})
