import { Module } from "@nestjs/common"
import { PremiumGuard } from "./premium.guard"
import { RevenueCatService } from "./revenuecat.service"

@Module({
	providers: [RevenueCatService, PremiumGuard],
	exports: [RevenueCatService, PremiumGuard],
})
export class PremiumModule {}
