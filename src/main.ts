import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const options = new DocumentBuilder()
    .setTitle('AuthNet transactions handler')
    .setDescription('The webhook trap and backend for authnet transactions')
    .setVersion('1.0')
    .addTag('authnet')
    .addBearerAuth({
      bearerFormat: 'jwt',
      type: 'http',
    })
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
