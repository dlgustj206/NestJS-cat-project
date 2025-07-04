import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/exceptions/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import * as expressBasicAuth from 'express-basic-auth';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ transform: true })); // class validation
  app.use(
    ['/docs', '/dpcs-json'],
    expressBasicAuth({
      challenge: true,
      users: {
        [process.env.SWAGGER_UER as string]: process.env
          .SWAGGER_PASSWORD as string,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('C.I.C')
    .setDescription('cat')
    .setVersion('1.0.0')
    .build();
  const document: OpenAPIObject = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document); // Swagger API의 엔드포인트 지정
  app.enableCors({
    origin: true, // 배포할 때는 true가 아닌 URL을 써주면 됨
    credentials: true,
  });
  const PORT = process.env.PORT;
  await app.listen(PORT!);
}
bootstrap();
