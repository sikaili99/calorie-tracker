import { NestFactory } from "@nestjs/core"
import { ValidationPipe } from "@nestjs/common"
import helmet from "helmet"
import { AppModule } from "./app.module"
import {
	AllExceptionsFilter,
	HttpExceptionFilter,
} from "./common/filters/http-exception.filter"

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		logger: ["log", "error", "warn"],
	})

	// Body size limit — needed for base64 photo uploads
	app.use(require("express").json({ limit: "10mb" }))
	app.use(require("express").urlencoded({ limit: "10mb", extended: true }))

	// Security headers
	app.use(helmet())

	// CORS
	app.enableCors()

	// Global validation pipe — strips unknown properties
	app.useGlobalPipes(
		new ValidationPipe({ whitelist: true, transform: true })
	)

	// Global exception filters — catch-all first, then HTTP-specific
	app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter())

	const port = process.env.PORT ?? 3000
	await app.listen(port)
	console.log(`Backend running on http://localhost:${port}`)
}

bootstrap()
