export class AzureRequest {
  readonly url: string;
  readonly context: Record<string, any>;
  readonly originalUrl: string;
  readonly headers: Record<string, any>;

  constructor(context: Record<string, any>) {
    Object.assign(this, context.req);
    this.context = context;
    this.url = this.originalUrl;
    this.headers = this.headers || {};
  }
}
