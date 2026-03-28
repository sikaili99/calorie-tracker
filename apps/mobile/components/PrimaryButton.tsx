import React, { useMemo } from "react"
import { ActivityIndicator, StyleSheet, ViewStyle } from "react-native"
import { useThemeColor } from "@/hooks/useThemeColor"
import { ThemedText } from "@/components/ThemedText"
import { CustomPressable } from "@/components/CustomPressable"
import { borderRadius } from "@/constants/Theme"

type PrimaryButtonProps = {
	label: string
	onPress: () => void
	isLoading?: boolean
	disabled?: boolean
	color?: string
	style?: ViewStyle
}

export const PrimaryButton = ({
	label,
	onPress,
	isLoading,
	disabled,
	color,
	style,
}: PrimaryButtonProps) => {
	const theme = useThemeColor()

	const styles = useMemo(
		() =>
			StyleSheet.create({
				button: {
					backgroundColor: color ?? theme.primary,
					paddingVertical: 16,
					borderRadius,
					alignItems: "center",
					opacity: disabled || isLoading ? 0.5 : 1,
				},
			}),
		[theme.primary, color, disabled, isLoading]
	)

	return (
		<CustomPressable
			borderRadius={borderRadius}
			style={{ ...styles.button, ...style }}
			onPress={onPress}
			disabled={disabled || isLoading}
		>
			{isLoading ? (
				<ActivityIndicator color={theme.background} />
			) : (
				<ThemedText type="defaultSemiBold" color={theme.background}>
					{label}
				</ThemedText>
			)}
		</CustomPressable>
	)
}
