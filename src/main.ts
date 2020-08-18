import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { join } from 'path';
import * as session from 'express-session';
import * as passport from 'passport';
import * as redis from 'redis';
import * as connectRedis from 'connect-redis';
import * as exphbs from 'express-handlebars';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const options = new DocumentBuilder()
    .setTitle('AuthNet transactions handler')
    .setDescription('The webhook trap and backend for authnet transactions')
    .setVersion('1.0')
    .addBearerAuth({
      bearerFormat: 'jwt',
      type: 'http',
    })
    .addCookieAuth()
    .build();

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
  });
  redisClient.on('connect', () => console.log('Redis connected'));
  redisClient.on('error', (e) => console.error(e));
  redisClient.on('end', () => console.log('Redis end'));
  redisClient.on('ready', () => console.log('Redis is ready'));
  app.use(
    session({
      secret: 'nest cats',
      resave: false,
      saveUninitialized: false,
      store: new RedisStore({ client: redisClient }),
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  app.useStaticAssets(join(__dirname, 'public'));
  app.set('views', join(__dirname, 'views'));
  const hbs = exphbs.create({
    layoutsDir: join(__dirname, 'views', 'layouts'),
    partialsDir: join(__dirname, 'views', 'partials'),
    defaultLayout: false,
    helpers: {
      json: function (context) {
        return JSON.stringify(context);
      },
    },
  });
  app.engine('handlebars', hbs.engine);
  app.set('view engine', 'handlebars');

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
