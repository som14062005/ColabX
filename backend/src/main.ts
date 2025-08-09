import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // ✅ Import this

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Enable CORS
  app.enableCors({
    origin: 'http://localhost:5173', // Vite frontend URL
    credentials: true, // if using cookies (optional)
  });

  // ✅ Enable validation globally
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
}
bootstrap();
