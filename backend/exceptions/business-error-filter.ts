import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { Response } from "express";
import BusinessError from "./business-error";

@Catch(BusinessError)
export class BusinessErrorFilter implements ExceptionFilter {
	catch(exception: BusinessError, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();

		response.status(400).json({
			statusCode: 400,
			message: exception.message,
		});
	}
}
