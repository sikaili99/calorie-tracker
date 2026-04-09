import { useThemeColor } from "@/hooks/useThemeColor"
import { usePressScale } from "@/hooks/useMotion"
import React, { useMemo } from "react"
import {
	Pressable,
	StyleSheet,
	PressableProps,
	ViewStyle,
	StyleProp,
	GestureResponderEvent,
} from "react-native"
import Animated from "react-native-reanimated"

type CustomPressableProps = Omit<PressableProps, "style"> &
	React.PropsWithChildren & {
		borderRadius?: number
		style?: StyleProp<ViewStyle>
		pressScale?: number
	}

export const CustomPressable = ({
	children,
	borderRadius,
	style,
	pressScale,
	...props
}: CustomPressableProps) => {
	const theme = useThemeColor()
	const { animatedStyle, handlePressIn, handlePressOut } =
		usePressScale(pressScale)
	const { onPressIn, onPressOut, testID, ...restProps } = props
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

	const handlePressInWithAnimation = (event: GestureResponderEvent) => {
		handlePressIn()
		onPressIn?.(event)
	}

	const handlePressOutWithAnimation = (event: GestureResponderEvent) => {
		handlePressOut()
		onPressOut?.(event)
	}

	return (
		<Animated.View style={[styles.wrapper, animatedStyle]} testID={testID}>
			<Pressable
				android_ripple={{
					color: `${theme.text}22`,
				}}
				style={pressableStyle}
				onPressIn={handlePressInWithAnimation}
				onPressOut={handlePressOutWithAnimation}
				testID={testID}
				{...restProps}
			>
				{children}
			</Pressable>
		</Animated.View>
	)
}
