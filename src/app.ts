import "dotenv/config"
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Opcional: habilitar CORS si lo vas a conectar pronto con el frontend
  app.enableCors();

  const PORT = process.env.PORT || 3000;
  await app.listen(PORT);
  console.log(`🚀 Servidor NestJS corriendo en http://localhost:${PORT}`);
}
bootstrap();