const normalizeEnvUrl = (value: string | undefined): string | undefined => {
	if (typeof value !== "string") return undefined
	const trimmed = value.trim()
	return trimmed.length > 0 ? trimmed : undefined
}

export const PRIVACY_POLICY_URL = normalizeEnvUrl(
	process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL
)

export const TERMS_URL = normalizeEnvUrl(process.env.EXPO_PUBLIC_TERMS_URL)

export const SUPPORT_URL = normalizeEnvUrl(process.env.EXPO_PUBLIC_SUPPORT_URL)
