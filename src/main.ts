import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    // comma-separated list of allowed front-end origins; cross-origin requests
    // are refused when the variable is not set
    origin: process.env.CORS_ORIGIN?.split(',') ?? false,
    // required for the browser to send the session cookie
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
