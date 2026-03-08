import { ValidationPipe } from "@nestjs/common";
import { AllExceptionsFilter } from "./common/filters/http-exception.filter";
import { PerformanceInterceptor } from "./common/interceptors/performance.interceptor";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { json } from "express";
import { AppModule } from "./app.module";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.enableCors({
		origin: process.env.CLIENT_URL?.split(",") || true,
		methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
		credentials: true,
	});
	app.use(json({ limit: "5mb" }));
	app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
	app.useGlobalFilters(new AllExceptionsFilter());
	app.useGlobalInterceptors(new PerformanceInterceptor());

	const config = new DocumentBuilder()
		.setTitle("saveit API")
		.setDescription("Backend API for saveit manager scheduling and time tracking")
		.addBearerAuth({
			type: "http",
			scheme: "bearer",
			in: "header",
		})
		.build();

	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup("api", app, document);

	console.log("Starting server on port", process.env.PORT ?? 8080);

	await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
