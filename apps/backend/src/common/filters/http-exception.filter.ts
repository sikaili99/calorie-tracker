import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
	HttpStatus,
	Logger,
} from "@nestjs/common"
import type { Request, Response } from "express"

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(HttpExceptionFilter.name)

	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp()
		const response = ctx.getResponse<Response>()
		const request = ctx.getRequest<Request>()
		const status = exception.getStatus()
		const exceptionResponse = exception.getResponse()

		const message =
			typeof exceptionResponse === "string"
				? exceptionResponse
				: typeof exceptionResponse === "object" &&
					  exceptionResponse !== null &&
					  "message" in exceptionResponse
					? String((exceptionResponse as Record<string, unknown>).message)
					: exception.message

		const errorName =
			typeof exceptionResponse === "object" &&
			exceptionResponse !== null &&
			"error" in exceptionResponse
				? String((exceptionResponse as Record<string, unknown>).error)
				: HttpStatus[status] ?? "Error"

		if (status >= 500) {
			this.logger.error(
				`[${request.method}] ${request.url} → ${status}: ${message}`
			)
		} else {
			this.logger.warn(
				`[${request.method}] ${request.url} → ${status}: ${message}`
			)
		}

		response.status(status).json({
			statusCode: status,
			error: errorName,
			message,
		})
	}
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	private readonly logger = new Logger(AllExceptionsFilter.name)

	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp()
		const response = ctx.getResponse<Response>()
		const request = ctx.getRequest<Request>()

		const message =
			exception instanceof Error ? exception.message : "Unexpected error"

		this.logger.error(
			`[${request.method}] ${request.url} → 500: ${message}`,
			exception instanceof Error ? exception.stack : undefined
		)

		response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
			statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
			error: "Internal Server Error",
			message: "An unexpected error occurred",
		})
	}
}
