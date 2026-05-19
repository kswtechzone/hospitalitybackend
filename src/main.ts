import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://kswtechzone.com.np',
      'https://ms.kswtechzone.com.np',
      'https://kswtechzone.com', // keep legacy for migration phase
      /\.kswtechzone\.com\.np$/,
      /\.kswtechzone\.com$/
    ],
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 4000);
  console.log(`Backend is running on: ${await app.getUrl()}`);
}
bootstrap();
