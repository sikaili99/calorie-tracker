#!/usr/bin/env node

const requiredKeys = [
	"EXPO_PUBLIC_BACKEND_URL",
	"EXPO_PUBLIC_GOOGLE_CLIENT_ID",
	"EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID",
	"EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID",
	"EXPO_PUBLIC_RC_IOS_API_KEY",
	"EXPO_PUBLIC_RC_ANDROID_API_KEY",
	"EXPO_PUBLIC_RC_ENTITLEMENT_ID",
	"EXPO_PUBLIC_PRIVACY_POLICY_URL",
	"EXPO_PUBLIC_TERMS_URL",
	"EXPO_PUBLIC_SUPPORT_URL",
]

const missing = requiredKeys.filter((key) => {
	const value = process.env[key]
	return typeof value !== "string" || value.trim().length === 0
})

if (missing.length > 0) {
	console.error("Missing required release env vars:")
	for (const key of missing) {
		console.error(`- ${key}`)
	}
	process.exit(1)
}

const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || ""
if (/localhost|127\.0\.0\.1/.test(backendUrl)) {
	console.error(
		`EXPO_PUBLIC_BACKEND_URL must be a reachable production URL, got: ${backendUrl}`
	)
	process.exit(1)
}

console.log("Release env check passed.")
