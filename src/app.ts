import "dotenv/config";
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { auth } from './config/auth.config';
import { fromNodeHeaders } from "better-auth/node";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );

  app.enableCors();

  const fastifyInstance = app.getHttpAdapter().getInstance();
  fastifyInstance.route({
    method: ["GET", "POST"],
    url: "/api/auth/*",
    async handler(request, reply) {

      const url = new URL(
        request.url,
        `http://${request.headers.host}`
      );

      const headers = fromNodeHeaders(request.headers);

      const req = new Request(url.toString(), {
        method: request.method,
        headers,
        ...(request.body
          ? { body: JSON.stringify(request.body) }
          : {}),
      });

      const response = await auth.handler(req);

      reply.status(response.status);

      response.headers.forEach((value, key) => {
        reply.header(key, value);
      });

      return reply.send(
        response.body
          ? await response.text()
          : null
      );
    }


  });

  const PORT = process.env.PORT || 3000;
  await app.listen(PORT);
  console.log(`🚀 Servidor NestJS corriendo en http://localhost:${PORT}`);
}
bootstrap();