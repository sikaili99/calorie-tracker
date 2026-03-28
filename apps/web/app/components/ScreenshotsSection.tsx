const screens = [
	{ label: "Daily Diary", accent: "from-primary/20 to-primary/5" },
	{ label: "AI Coach", accent: "from-purple-500/20 to-purple-500/5" },
	{ label: "Photo Log", accent: "from-green-500/20 to-green-500/5" },
	{ label: "Weekly Report", accent: "from-orange-400/20 to-orange-400/5" },
]

export default function ScreenshotsSection() {
	return (
		<section id="screenshots" className="py-24 px-4 bg-bg-dark">
			<div className="max-w-6xl mx-auto">
				<div className="text-center mb-16">
					<h2 className="text-4xl font-bold text-white mb-4">
						Designed for simplicity
					</h2>
					<p className="text-gray-400 text-lg">
						A clean, intuitive interface for every day.
					</p>
				</div>
				<div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory justify-center">
					{screens.map((screen) => (
						<div
							key={screen.label}
							className="flex-shrink-0 snap-center w-48 sm:w-56"
						>
							<div
								className="relative rounded-[2rem] border-2 border-white/10 overflow-hidden bg-surface"
								style={{ paddingBottom: "216%" }}
							>
								<div
									className={`absolute inset-0 bg-gradient-to-b ${screen.accent} flex items-center justify-center`}
								>
									<span className="text-white/40 text-xs font-medium text-center px-4">
										{screen.label}
										<br />
										<span className="text-white/20">Screenshot placeholder</span>
									</span>
								</div>
							</div>
							<p className="text-center text-gray-400 text-sm mt-3">
								{screen.label}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}
