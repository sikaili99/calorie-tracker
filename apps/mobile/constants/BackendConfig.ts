// Base URL for the AI backend.
// Development: set to your local server (e.g. http://localhost:3000)
// Production: set to your deployed backend URL
export const BACKEND_BASE_URL =
	process.env.EXPO_PUBLIC_BACKEND_URL ?? "http://localhost:3000"
