export default function HeroSection() {
	return (
		<section
			className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-16 overflow-hidden"
			style={{
				background:
					"radial-gradient(ellipse 80% 60% at 50% -10%, rgba(91,190,249,0.15) 0%, transparent 70%)",
			}}
		>
			<div className="relative z-10 max-w-3xl mx-auto">
				<span className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
					Free &amp; Open Source
				</span>
				<h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
					Track what you eat.{" "}
					<span className="text-primary">Understand your body.</span>
				</h1>
				<p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
					Calorie Tracker gives you a daily diary, AI coaching, photo
					food logging, and a massive database — all in one free, open-source
					React Native app.
				</p>
				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<a
						href="#download"
						className="px-8 py-4 bg-primary text-bg-dark font-semibold rounded-xl hover:bg-primary/90 transition-colors text-base"
					>
						Download Free
					</a>
					<a
						href="#open-source"
						className="px-8 py-4 bg-surface text-white font-semibold rounded-xl border border-white/10 hover:border-primary/30 transition-colors text-base"
					>
						View on GitHub
					</a>
				</div>
			</div>

			<div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg-dark to-transparent" />
		</section>
	)
}
