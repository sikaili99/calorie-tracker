export default function Navbar() {
	return (
		<nav className="fixed top-0 left-0 right-0 z-50 bg-bg-dark/80 backdrop-blur-md border-b border-white/5">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
				<span className="text-primary font-bold text-lg tracking-tight">
					Simple Calorie Tracker
				</span>
				<div className="hidden sm:flex gap-6 text-sm text-gray-400">
					<a href="#features" className="hover:text-primary transition-colors">
						Features
					</a>
					<a
						href="#screenshots"
						className="hover:text-primary transition-colors"
					>
						Screenshots
					</a>
					<a href="#download" className="hover:text-primary transition-colors">
						Download
					</a>
					<a
						href="#open-source"
						className="hover:text-primary transition-colors"
					>
						Open Source
					</a>
				</div>
			</div>
		</nav>
	)
}
