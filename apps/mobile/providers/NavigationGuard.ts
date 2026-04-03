/**
 * Module-level singleton flag. Unlike React refs, this survives component
 * remounts caused by Expo Router's cached state restoration.
 *
 * Set to true once AppNavigator has determined the correct initial route
 * and fired router.replace(). Until then, (tabs) must not render.
 */
export let navigationResolved = false

export function markNavigationResolved() {
	navigationResolved = true
}
