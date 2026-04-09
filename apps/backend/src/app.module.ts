import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler"
import { APP_GUARD } from "@nestjs/core"
import { AiModule } from "./ai/ai.module"
import { AuthModule } from "./auth/auth.module"
import { CommonModule } from "./common/common.module"
import { DiaryModule } from "./diary/diary.module"
import { PrismaModule } from "./prisma/prisma.module"

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
		PrismaModule,
		AuthModule,
		AiModule,
		DiaryModule,
		CommonModule,
	],
	providers: [
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		},
	],
})
export class AppModule {}
