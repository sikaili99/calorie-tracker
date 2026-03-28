const techStack = [
	"Expo SDK 55",
	"React Native",
	"NestJS",
	"Prisma",
	"PostgreSQL",
	"TypeScript",
]

export default function OpenSourceSection() {
	return (
		<footer
			id="open-source"
			className="py-24 px-4 bg-bg-dark border-t border-white/5"
		>
			<div className="max-w-4xl mx-auto text-center">
				<h2 className="text-4xl font-bold text-white mb-4">
					Open Source &amp; Free Forever
				</h2>
				<p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
					Calorie Tracker is fully open source. Inspect the code, contribute,
					or self-host the backend. Built by{" "}
					<a
						href="https://github.com/sikaili99"
						className="text-primary hover:underline"
						target="_blank"
						rel="noopener noreferrer"
					>
						Mathews Musukuma
					</a>
					.
				</p>

				<div className="bg-surface border border-white/5 rounded-2xl p-8 mb-8 text-left max-w-2xl mx-auto">
					<div className="flex items-center gap-3 mb-4">
						<svg
							className="w-6 h-6 text-white"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
						</svg>
						<code className="text-primary text-sm">
							github.com/sikaili99/calorie-tracker
						</code>
					</div>
					<div className="flex flex-wrap gap-2">
						{techStack.map((tech) => (
							<span
								key={tech}
								className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs"
							>
								{tech}
							</span>
						))}
					</div>
				</div>

				<a
					href="https://github.com/sikaili99/calorie-tracker"
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 transition-colors"
				>
					<svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
						<path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
					</svg>
					Star on GitHub
				</a>

				<p className="text-gray-600 text-sm mt-12">
					© 2026 Mathews Musukuma. MIT License.
				</p>
			</div>
		</footer>
	)
}
