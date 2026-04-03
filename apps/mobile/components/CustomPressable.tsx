import { useThemeColor } from "@/hooks/useThemeColor"
import React, { useMemo } from "react"
import {
	Pressable,
	View,
	StyleSheet,
	PressableProps,
	ViewStyle,
	StyleProp,
} from "react-native"

type CustomPressableProps = Omit<PressableProps, "style"> &
	React.PropsWithChildren & {
		borderRadius?: number
		style?: StyleProp<ViewStyle>
	}

export const CustomPressable = ({
	children,
	borderRadius,
	style,
	...props
}: CustomPressableProps) => {
	const theme = useThemeColor()
	const {
		margin,
		marginTop,
		marginBottom,
		marginLeft,
		marginRight,
		marginHorizontal,
		marginVertical,
		...pressableStyle
	} = StyleSheet.flatten(style || {})

	const styles = useMemo(
		() =>
			StyleSheet.create({
				wrapper: {
					// TODO with overflow hidden we hide the ripple effect outside the border radius,
					// but it makes the hitSlop not work. This needs to be fixed.
					overflow: "hidden",
					borderRadius,
					margin,
					marginTop,
					marginBottom,
					marginLeft,
					marginRight,
					marginHorizontal,
					marginVertical,
				},
			}),
		[
			borderRadius,
			margin,
			marginTop,
			marginBottom,
			marginLeft,
			marginRight,
			marginHorizontal,
			marginVertical,
		]
	)

	return (
		<View style={styles.wrapper} testID={props.testID}>
			<Pressable
				android_ripple={{
					color: `${theme.text}22`,
				}}
				style={pressableStyle}
				{...props}
			>
				{children}
			</Pressable>
		</View>
	)
}
