import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
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
  const viewsPath = join(__dirname, 'views');
  app.set('views', viewsPath);
  app.set('view engine', 'ejs');
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
