import { OutgoingMessage } from 'http';

export class AzureReply extends OutgoingMessage {
  private readonly _headerSent: boolean;
  private readonly outputData: { data: any }[];
  statusCode?: number;

  constructor(context: Record<string, any>) {
    super();

    // Avoid issues when data is streamed out
    this._headerSent = true;

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
    // If data was streamed out, get it back to body
    if (body === undefined && this.outputData.length > 0) {
      body = Buffer.concat(
        this.outputData.map(o =>
          Buffer.isBuffer(o.data) ? o.data : Buffer.from(o.data)
        )
      );
    }

    context.res.status = this.statusCode;
    context.res.body = body;
    context.done();
  }
}
