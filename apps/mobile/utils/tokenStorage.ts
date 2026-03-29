import * as SecureStore from "expo-secure-store"

const ACCESS_KEY = "AUTH_ACCESS_TOKEN"
const REFRESH_KEY = "AUTH_REFRESH_TOKEN"

export const tokenStorage = {
	async saveTokens(access: string, refresh: string): Promise<void> {
		await Promise.all([
			SecureStore.setItemAsync(ACCESS_KEY, access),
			SecureStore.setItemAsync(REFRESH_KEY, refresh),
		])
	},

	async getAccessToken(): Promise<string | null> {
		return SecureStore.getItemAsync(ACCESS_KEY)
	},

	async getRefreshToken(): Promise<string | null> {
		return SecureStore.getItemAsync(REFRESH_KEY)
	},

	async clearTokens(): Promise<void> {
		await Promise.all([
			SecureStore.deleteItemAsync(ACCESS_KEY),
			SecureStore.deleteItemAsync(REFRESH_KEY),
		])
	},
}
