import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { json } from "express";
import { AppModule } from "./app.module";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	const expressApp = app.getHttpAdapter().getInstance();
	expressApp.set("trust proxy", 1);
	app.use((req, res, next) => {
		const isProduction = process.env.NODE_ENV === "production";
		if (isProduction && req.protocol !== "https") {
			return res.status(400).json({
				message: "HTTPS is required",
			});
		}
		next();
	});

	app.enableCors();
	app.use(json({ limit: "50mb" }));
	app.useGlobalPipes(new ValidationPipe());

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
