import { OutgoingMessage } from 'http';

export class AzureReply extends OutgoingMessage {
  statusCode?: number;

  constructor(context: Record<string, any>) {
    super();

    this.writeHead = this.writeHead.bind(this, context);
    this.end = this.finish.bind(this, context);
  }

  writeHead(
    context: Record<string, any>,
    statusCode: number,
    statusMessage: string,
    headers: Record<string, any>
  ) {
    if (statusCode) {
      this.statusCode = statusCode;
    }
    if (headers) {
      const keys = Object.keys(headers);
      for (const key of keys) {
        this.setHeader(key, headers[key]);
      }
    }

    context.res.status = this.statusCode;
    context.res.headers = this.getHeaders() || {};
  }

  finish(context: Record<string, any>, body: Record<string, any> | undefined) {
    context.res.status = this.statusCode;
    context.res.body = body;
    context.done();
  }
}
