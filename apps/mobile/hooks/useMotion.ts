import {
	Easing,
	FadeIn,
	FadeInDown,
	FadeOut,
	FadeOutUp,
	LinearTransition,
	useAnimatedStyle,
	useReducedMotion,
	useSharedValue,
	withSpring,
} from "react-native-reanimated"

export const motionDurations = {
	quick: 180,
	standard: 240,
	emphasis: 320,
}

const motionEasing = Easing.out(Easing.cubic)

const motionSpringConfig = {
	damping: 18,
	stiffness: 220,
	mass: 0.85,
}

export const useMotionEnabled = () => !useReducedMotion()

export const getFadeInAnimation = (
	motionEnabled: boolean,
	delay = 0,
	duration = motionDurations.standard
) =>
	motionEnabled
		? FadeIn.duration(duration).delay(delay).easing(motionEasing)
		: undefined

export const getFadeInDownAnimation = (
	motionEnabled: boolean,
	delay = 0,
	duration = motionDurations.standard
) =>
	motionEnabled
		? FadeInDown.duration(duration).delay(delay).easing(motionEasing)
		: undefined

export const getFadeOutAnimation = (
	motionEnabled: boolean,
	duration = motionDurations.quick
) =>
	motionEnabled ? FadeOut.duration(duration).easing(motionEasing) : undefined

export const getFadeOutUpAnimation = (
	motionEnabled: boolean,
	duration = motionDurations.quick
) =>
	motionEnabled
		? FadeOutUp.duration(duration).easing(motionEasing)
		: undefined

export const getLayoutTransition = (motionEnabled: boolean) =>
	motionEnabled
		? LinearTransition.springify()
				.damping(motionSpringConfig.damping)
				.stiffness(motionSpringConfig.stiffness)
				.mass(motionSpringConfig.mass)
		: undefined

export const usePressScale = (pressScale?: number) => {
	const motionEnabled = useMotionEnabled()
	const scale = useSharedValue(1)
	const targetScale = pressScale ?? 1

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}))

	const animateTo = (nextValue: number) => {
		if (!motionEnabled || targetScale === 1) {
			scale.value = nextValue
			return
		}

		scale.value = withSpring(nextValue, motionSpringConfig)
	}

	return {
		animatedStyle,
		handlePressIn: () => {
			if (targetScale < 1) {
				animateTo(targetScale)
			}
		},
		handlePressOut: () => animateTo(1),
		motionEnabled,
	}
}
