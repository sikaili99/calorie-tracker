import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react"
import * as Google from "expo-auth-session/providers/google"
import * as WebBrowser from "expo-web-browser"
import { tokenStorage } from "@/utils/tokenStorage"
import { BackendAPI } from "@/api/BackendAPI"
import type { AuthUser } from "@calorie-tracker/shared-types"

WebBrowser.maybeCompleteAuthSession()

interface AuthContextProps {
	user: AuthUser | null
	isAuthenticated: boolean
	isAuthLoading: boolean
	login: (email: string, password: string) => Promise<void>
	register: (
		firstName: string,
		lastName: string,
		email: string,
		password: string
	) => Promise<void>
	loginWithGoogle: () => Promise<void>
	logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined)

export const AuthProvider: React.FC<React.PropsWithChildren> = ({
	children,
}) => {
	const [user, setUser] = useState<AuthUser | null>(null)
	const [isAuthLoading, setIsAuthLoading] = useState(true)

	const [_googleRequest, googleResponse, googlePromptAsync] =
		Google.useAuthRequest({
			clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
		})

	// Resolve the google sign-in promise after the auth session response
	const googleResolveRef = useRef<
		((value: void | PromiseLike<void>) => void) | null
	>(null)
	const googleRejectRef = useRef<((reason?: unknown) => void) | null>(null)

	// Handle google auth session response
	useEffect(() => {
		if (!googleResponse) return
		if (googleResponse.type === "success") {
			const idToken = googleResponse.authentication?.idToken
			if (!idToken) {
				googleRejectRef.current?.(new Error("No ID token from Google"))
				return
			}
			BackendAPI.googleAuth(idToken)
				.then(({ user: u, accessToken, refreshToken }) =>
					tokenStorage.saveTokens(accessToken, refreshToken).then(() => {
						setUser(u)
						googleResolveRef.current?.()
					})
				)
				.catch((err) => {
					googleRejectRef.current?.(err)
				})
		} else if (
			googleResponse.type === "error" ||
			googleResponse.type === "dismiss"
		) {
			googleRejectRef.current?.(
				new Error(googleResponse.type === "error" ? "Google auth failed" : "Dismissed")
			)
		}
	}, [googleResponse])

	// Validate stored token on mount
	useEffect(() => {
		const restoreSession = async () => {
			try {
				const accessToken = await tokenStorage.getAccessToken()
				if (!accessToken) return
				const u = await BackendAPI.getMe()
				setUser(u)
			} catch {
				// Access token expired — try refresh
				try {
					const refreshToken = await tokenStorage.getRefreshToken()
					if (!refreshToken) return
					const { user: u, accessToken, refreshToken: newRefresh } =
						await BackendAPI.refreshTokens(refreshToken)
					await tokenStorage.saveTokens(accessToken, newRefresh)
					setUser(u)
				} catch {
					await tokenStorage.clearTokens()
				}
			} finally {
				setIsAuthLoading(false)
			}
		}
		restoreSession()
	}, [])

	const login = useCallback(async (email: string, password: string) => {
		const { user: u, accessToken, refreshToken } =
			await BackendAPI.login(email, password)
		await tokenStorage.saveTokens(accessToken, refreshToken)
		setUser(u)
	}, [])

	const register = useCallback(
		async (
			firstName: string,
			lastName: string,
			email: string,
			password: string
		) => {
			const { user: u, accessToken, refreshToken } =
				await BackendAPI.register(firstName, lastName, email, password)
			await tokenStorage.saveTokens(accessToken, refreshToken)
			setUser(u)
		},
		[]
	)

	const loginWithGoogle = useCallback((): Promise<void> => {
		return new Promise((resolve, reject) => {
			googleResolveRef.current = resolve
			googleRejectRef.current = reject
			googlePromptAsync()
		})
	}, [googlePromptAsync])

	const logout = useCallback(async () => {
		try {
			const refreshToken = await tokenStorage.getRefreshToken()
			if (refreshToken) await BackendAPI.logout(refreshToken)
		} catch {
			// best-effort
		} finally {
			await tokenStorage.clearTokens()
			setUser(null)
		}
	}, [])

	const contextValue = useMemo(
		() => ({
			user,
			isAuthenticated: !!user,
			isAuthLoading,
			login,
			register,
			loginWithGoogle,
			logout,
		}),
		[user, isAuthLoading, login, register, loginWithGoogle, logout]
	)

	return (
		<AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
	)
}

export const useAuth = (): AuthContextProps => {
	const context = useContext(AuthContext)
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider")
	}
	return context
}
