import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import helmet from "helmet";
import * as express from "express";
import { NestExpressApplication } from "@nestjs/platform-express";


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set("trust proxy", 1);
  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // 🌍 Détection de l'environnement
  // ✅ B3: CORS whitelist + credentials
  const allowedOrigins = (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  app.useLogger(new Logger()); // Utilise le logger Nest
  app.use(cookieParser());
  app.enableCors({
    origin: (origin, cb) => {
      // Autoriser les requêtes sans origin (curl/postman)
      if (!origin) return cb(null, true);

      const allowedOrigins = (process.env.CORS_ORIGINS ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (allowedOrigins.includes(origin)) return cb(null, true);

      console.warn("❌ CORS blocked origin:", origin);
      return cb(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  if (process.env.NODE_ENV !== "production") {
    const config = new DocumentBuilder()
      .setTitle("SkillMatch API")
      .setVersion("1.0")
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("docs", app, document);
  }

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();