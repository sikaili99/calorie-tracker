const features = [
	{
		icon: "📖",
		title: "Daily Diary",
		description:
			"Log every meal with detailed calorie, carb, protein, and fat breakdowns. Visualise your day at a glance.",
	},
	{
		icon: "🤖",
		title: "AI Coach",
		description:
			"Get conversational nutrition guidance tailored to your goals. Ask anything, get science-backed answers.",
	},
	{
		icon: "📷",
		title: "Photo Logging",
		description:
			"Snap a photo of your meal and let AI identify the food and estimate macros automatically.",
	},
	{
		icon: "📊",
		title: "Weekly AI Report",
		description:
			"Receive auto-generated weekly insights and recommendations based on your actual eating patterns.",
	},
	{
		icon: "🏆",
		title: "Achievements",
		description:
			"Stay motivated with streaks, badges, and gamification that reward consistent tracking.",
	},
	{
		icon: "🥗",
		title: "Huge Food Database",
		description:
			"Access USDA and OpenFoodFacts data — millions of foods, available offline.",
	},
]

export default function FeaturesSection() {
	return (
		<section id="features" className="py-24 px-4 bg-bg-dark">
			<div className="max-w-6xl mx-auto">
				<div className="text-center mb-16">
					<h2 className="text-4xl font-bold text-white mb-4">
						Everything you need to eat better
					</h2>
					<p className="text-gray-400 text-lg max-w-xl mx-auto">
						Powerful features without the complexity. Built for people who want
						real results.
					</p>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{features.map((f) => (
						<div
							key={f.title}
							className="bg-surface rounded-2xl p-6 border border-white/5 hover:border-primary/20 transition-colors"
						>
							<div className="text-3xl mb-4">{f.icon}</div>
							<h3 className="text-white font-semibold text-lg mb-2">
								{f.title}
							</h3>
							<p className="text-gray-400 text-sm leading-relaxed">
								{f.description}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}
