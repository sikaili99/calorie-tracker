export default function CtaSection() {
	return (
		<section
			id="download"
			className="py-24 px-4"
			style={{
				background: "linear-gradient(135deg, #1B2232 0%, #111928 100%)",
			}}
		>
			<div className="max-w-3xl mx-auto text-center">
				<h2 className="text-4xl font-bold text-white mb-4">
					Start tracking today. It&apos;s free.
				</h2>
				<p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
					Available on iOS and Android. No subscription required for core
					features.
				</p>
				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<a
						href="#"
						className="flex items-center gap-3 px-6 py-4 bg-white text-bg-dark rounded-xl font-semibold hover:bg-gray-100 transition-colors"
						aria-label="Download on the App Store"
					>
						<svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
							<path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
						</svg>
						<div className="text-left">
							<div className="text-xs text-gray-600">Download on the</div>
							<div className="text-sm font-bold">App Store</div>
						</div>
					</a>

					<a
						href="#"
						className="flex items-center gap-3 px-6 py-4 bg-white text-bg-dark rounded-xl font-semibold hover:bg-gray-100 transition-colors"
						aria-label="Get it on Google Play"
					>
						<svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
							<path d="M3 20.5v-17c0-.83.94-1.3 1.6-.8l14 8.5c.6.37.6 1.23 0 1.6l-14 8.5c-.66.5-1.6.03-1.6-.8z" />
						</svg>
						<div className="text-left">
							<div className="text-xs text-gray-600">Get it on</div>
							<div className="text-sm font-bold">Google Play</div>
						</div>
					</a>
				</div>
			</div>
		</section>
	)
}
