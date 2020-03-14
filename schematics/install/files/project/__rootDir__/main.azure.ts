import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { <%= getRootModuleName() %> } from './<%= getRootModulePath() %>';

export async function createApp(): Promise<INestApplication> {
  const app = await NestFactory.create(<%= getRootModuleName() %>);
  app.setGlobalPrefix('api');
  
  await app.init();
  return app;
}
