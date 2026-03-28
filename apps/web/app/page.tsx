import Navbar from "./components/Navbar"
import HeroSection from "./components/HeroSection"
import FeaturesSection from "./components/FeaturesSection"
import ScreenshotsSection from "./components/ScreenshotsSection"
import CtaSection from "./components/CtaSection"
import OpenSourceSection from "./components/OpenSourceSection"

export default function HomePage() {
	return (
		<main>
			<Navbar />
			<HeroSection />
			<FeaturesSection />
			<ScreenshotsSection />
			<CtaSection />
			<OpenSourceSection />
		</main>
	)
}
