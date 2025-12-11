import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // 🌍 Détection de l'environnement
  const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://skillmatch.local:5173',
    'http://admin.skillmatch.local:5173',
  ];
  app.useLogger(new Logger()); // Utilise le logger Nest
  app.use(cookieParser());
  app.enableCors({
    origin: (origin, callback) => {
      // origin peut être undefined (ex: Postman)
      if (!origin) {
        return callback(null, true);
      }

      // 💚 Autoriser tout localhost (peu importe le port) → Flutter Web, autres front dev
      if (
        origin.startsWith('http://localhost') ||
        origin.startsWith('http://127.0.0.1') ||
        allowedOrigins.includes(origin)
      ) {
        return callback(null, true);
      }

      console.warn('❌ Origin non autorisée:', origin);
      return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,           // si tu utilises des cookies ou tokens
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('SkillMatch API')
    .setDescription('Documentation de l’API SkillMatch')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/docs', app, document);

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
  console.log('🚀 Backend running at http://localhost:3000');
}
bootstrap();
