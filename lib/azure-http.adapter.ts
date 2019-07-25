import { Context, HttpRequest } from '@azure/functions';
import { INestApplication } from '@nestjs/common';
import { createHandler } from 'azure-function-express';

let handler: Function;

export class AzureHttpAdapterStatic {
  handle(
    createApp: () => Promise<INestApplication>,
    context: Context,
    req: HttpRequest
  ) {
    if (handler) {
      return handler(context, req);
    }
    this.createHandler(createApp).then(fn => fn(context, req));
  }

  private async createHandler(createApp: () => Promise<INestApplication>) {
    const app = await createApp();
    const instance = app.getHttpAdapter().getInstance();
    handler = createHandler(instance);
    return handler;
  }
}

export const AzureHttpAdapter = new AzureHttpAdapterStatic();
