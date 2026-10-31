import { createHandlerAdapter } from './azure-adapter';
import { AzureReply } from './azure-reply';

describe('AzureReply', () => {
  let context: Record<string, any>;
  let reply: AzureReply;

  beforeEach(() => {
    context = { req: {}, res: {}, done: jest.fn() };
    reply = new AzureReply(context);
  });

  it('copies headers when ending without an explicit writeHead call', () => {
    reply.statusCode = 201;
    reply.setHeader('Content-Type', 'text/plain');
    reply.setHeader('MyHeader', 'MyHeaderValue');

    reply.end('Hello World!');

    expect(context.res).toEqual({
      status: 201,
      headers: {
        'content-type': 'text/plain',
        myheader: 'MyHeaderValue'
      },
      body: 'Hello World!'
    });
    expect(context.done).toHaveBeenCalledTimes(1);
  });

  it('preserves a redirect status and Location header', () => {
    reply.statusCode = 302;
    reply.setHeader('Location', '/login');

    reply.end();

    expect(context.res.status).toBe(302);
    expect(context.res.headers).toEqual({ location: '/login' });
    expect(context.done).toHaveBeenCalledTimes(1);
  });

  it('copies the latest headers after an explicit writeHead call', () => {
    Reflect.apply(reply.writeHead, reply, [
      202,
      'Accepted',
      { 'X-Request-Id': 'original', 'X-Removed': 'remove me' }
    ]);
    reply.setHeader('X-Request-Id', 'updated');
    reply.removeHeader('X-Removed');

    reply.end('accepted');

    expect(context.res.status).toBe(202);
    expect(context.res.headers).toEqual({ 'x-request-id': 'updated' });
    expect(context.res.body).toBe('accepted');
    expect(context.done).toHaveBeenCalledTimes(1);
  });

  it('preserves multiple header values and a Buffer body', () => {
    const cookies = ['first=1', 'second=2'];
    const body = Buffer.from('body');
    reply.setHeader('Set-Cookie', cookies);
    reply.setHeader('Content-Length', body.length);

    reply.end(body);

    expect(context.res.headers).toEqual({
      'set-cookie': cookies,
      'content-length': body.length
    });
    expect(context.res.body).toBe(body);
    expect(context.done).toHaveBeenCalledTimes(1);
  });

  it('preserves buffered body chunks when ending without a body', () => {
    // Seed OutgoingMessage's buffered chunks without requiring a socket.
    Reflect.get(reply, 'outputData').push(
      { data: Buffer.from('Hello ') },
      { data: 'World!' }
    );
    reply.setHeader('Content-Type', 'text/plain');

    reply.end();

    expect(context.res.body).toEqual(Buffer.from('Hello World!'));
    expect(context.res.headers).toEqual({ 'content-type': 'text/plain' });
    expect(context.done).toHaveBeenCalledTimes(1);
  });

  it('can end an empty response without headers', () => {
    reply.statusCode = 204;

    reply.end();

    expect(context.res).toEqual({ status: 204, headers: {}, body: undefined });
    expect(context.done).toHaveBeenCalledTimes(1);
  });

  it('preserves headers through the handler adapter', () => {
    const handler = createHandlerAdapter((_request, response: AzureReply) => {
      response.setHeader('MyHeader', 'MyHeaderValue');
      response.end('Hello World!');
    });

    handler(context);

    expect(context.res.headers).toEqual({ myheader: 'MyHeaderValue' });
    expect(context.res.body).toBe('Hello World!');
    expect(context.done).toHaveBeenCalledTimes(1);
  });
});
