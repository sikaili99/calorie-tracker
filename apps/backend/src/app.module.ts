import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { AiModule } from "./ai/ai.module"
import { AuthModule } from "./auth/auth.module"
import { PrismaModule } from "./prisma/prisma.module"

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		PrismaModule,
		AuthModule,
		AiModule,
	],
})
export class AppModule {}
