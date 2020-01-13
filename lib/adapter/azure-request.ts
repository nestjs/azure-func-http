import { Readable } from 'stream';

export class AzureRequest extends Readable {
  readonly url: string;
  readonly context: Record<string, any>;
  readonly originalUrl: string;
  readonly headers: Record<string, any>;
  readonly body: any;

  constructor(context: Record<string, any>) {
    super();

    Object.assign(this, context.req);
    this.context = context;
    this.url = this.originalUrl;
    this.headers = this.headers || {};

    // Recreate original request stream from body
    const body = Buffer.isBuffer(context.req.body)
      ? context.req.body
      : context.req.rawBody;

    if (body !== null && body !== undefined) {
      this.push(body);
    }
    // Close the stream
    this.push(null);
  }
}
