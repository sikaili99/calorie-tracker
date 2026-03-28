import { StyleSheet, View } from "react-native"
import { ThemedText } from "./ThemedText"
import { useMemo, useState } from "react"
import { useThemeColor } from "@/hooks/useThemeColor"
import { CustomPressable } from "./CustomPressable"
import { CustomModal } from "./CustomModal"
import { borderRadius } from "@/constants/Theme"
import Ionicons from "@expo/vector-icons/Ionicons"

type SettingItemProps = {
	title: string
	value: string
	onSubmit: () => void
	iconName?: React.ComponentProps<typeof Ionicons>["name"]
	isFirst?: boolean
	isLast?: boolean
} & React.PropsWithChildren

export const SettingItem = ({
	title,
	value,
	onSubmit,
	iconName,
	isFirst,
	isLast,
	children,
}: SettingItemProps) => {
	const theme = useThemeColor()
	const [modalVisible, setModalVisible] = useState(false)

	const styles = useMemo(
		() =>
			StyleSheet.create({
				row: {
					flexDirection: "row",
					alignItems: "center",
					paddingHorizontal: 16,
					paddingVertical: 14,
					backgroundColor: theme.surface,
					gap: 12,
				},
				rowFirst: {
					borderTopLeftRadius: borderRadius,
					borderTopRightRadius: borderRadius,
				},
				rowLast: {
					borderBottomLeftRadius: borderRadius,
					borderBottomRightRadius: borderRadius,
				},
				iconCircle: {
					width: 32,
					height: 32,
					borderRadius: 8,
					backgroundColor: theme.primaryAlpha20,
					alignItems: "center",
					justifyContent: "center",
				},
				textBlock: {
					flex: 1,
				},
				separator: {
					height: StyleSheet.hairlineWidth,
					backgroundColor: theme.onSurface,
					marginLeft: 60,
				},
			}),
		[theme]
	)

	const handlePress = () => setModalVisible(true)
	const handleDismiss = () => setModalVisible(false)
	const handleSubmit = () => {
		onSubmit()
		setModalVisible(false)
	}

	return (
		<>
			<CustomPressable
				style={[
					styles.row,
					isFirst && styles.rowFirst,
					isLast && styles.rowLast,
				]}
				onPress={handlePress}
			>
				{iconName && (
					<View style={styles.iconCircle}>
						<Ionicons name={iconName} size={17} color={theme.primary} />
					</View>
				)}
				<View style={styles.textBlock}>
					<ThemedText type="default">{title}</ThemedText>
				</View>
				<ThemedText type="subtitleBold" color={theme.primary}>
					{value}
				</ThemedText>
				<Ionicons name="chevron-forward" size={16} color={theme.text} style={{ opacity: 0.3 }} />
			</CustomPressable>
			{!isLast && <View style={styles.separator} />}
			<CustomModal
				visible={modalVisible}
				onDismiss={handleDismiss}
				onSubmit={handleSubmit}
				title={title}
			>
				{children}
			</CustomModal>
		</>
	)
}
