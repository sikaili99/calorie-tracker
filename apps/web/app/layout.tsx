import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
	title: "Calorie Tracker — Free, Open-Source Nutrition App",
	description:
		"Track calories, macros, and meals with AI coaching, photo logging, and a massive food database. Free and open source.",
	openGraph: {
		title: "Calorie Tracker",
		description:
			"Free, open-source React Native app for tracking calories and macros.",
		type: "website",
	},
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en">
			<body className="antialiased">{children}</body>
		</html>
	)
}
