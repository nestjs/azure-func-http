import { AzureReply } from './azure-reply';

describe('AzureReply', () => {
  it('should copy response headers to context.res.headers on finish', (done) => {
    const context: Record<string, any> = {
      res: {},
      done: () => {
        expect(context.res.headers).toEqual({
          'x-custom-header': 'test-value'
        });
        expect(context.res.status).toBe(200);
        expect(context.res.body).toEqual({ success: true });
        done();
      }
    };

    const reply = new AzureReply(context);
    reply.statusCode = 200;
    reply.setHeader('X-Custom-Header', 'test-value');
    reply.end({ success: true });
  });

  it('should preserve headers already set via writeHead on finish', (done) => {
    const context: Record<string, any> = {
      res: {},
      done: () => {
        expect(context.res.headers['x-first']).toBe('1');
        expect(context.res.headers['x-second']).toBe('2');
        expect(context.res.status).toBe(201);
        done();
      }
    };

    const reply = new AzureReply(context);
    reply.writeHead(201, 'Created', { 'X-First': '1' });
    reply.setHeader('X-Second', '2');
    reply.end('done');
  });
});
