import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { AiModule } from "./ai/ai.module"
import { AuthModule } from "./auth/auth.module"
import { DiaryModule } from "./diary/diary.module"
import { PrismaModule } from "./prisma/prisma.module"

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		PrismaModule,
		AuthModule,
		AiModule,
		DiaryModule,
	],
})
export class AppModule {}
