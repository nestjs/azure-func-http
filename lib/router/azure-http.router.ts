/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import {
  HttpStatus,
  InternalServerErrorException,
  NotImplementedException,
  RequestMethod,
  VersioningOptions
} from '@nestjs/common';
import { VersionValue } from '@nestjs/common/interfaces';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { AbstractHttpAdapter } from '@nestjs/core';
import { RouterMethodFactory } from '@nestjs/core/helpers/router-method-factory';
import * as cors from 'cors';
import TRouter from 'trouter';
import { AzureReply, AzureRequest } from '../adapter';

export class AzureHttpRouter extends AbstractHttpAdapter {
  private readonly routerMethodFactory = new RouterMethodFactory();

  constructor() {
    super(new TRouter());
  }

  public handle(context: Record<string, any>, request: any) {
    const req = context.req;
    const originalUrl = req.originalUrl as string;
    const path = new URL(originalUrl).pathname;

    const { params, handlers } = this.instance.find(req.method, path);
    req.params = params;

    if (handlers.length === 0) {
      return this.handleNotFound(context, req.method, originalUrl);
    }
    const azureRequest = new AzureRequest(context);
    const azureReply = new AzureReply(context);
    const nextRoute = (i = 0) =>
      handlers[i] &&
      handlers[i](azureRequest, azureReply, () => nextRoute(i + 1));
    nextRoute();
  }

  public handleNotFound(
    context: Record<string, any>,
    method: string,
    originalUrl: string
  ) {
    context.res.status = HttpStatus.NOT_FOUND;
    context.res.body = {
      statusCode: HttpStatus.NOT_FOUND,
      error: `Cannot ${method} ${originalUrl}`
    };
    context.done();
    return;
  }

  public enableCors(options: CorsOptions) {
    this.use(cors(options));
  }

  public reply(response: any, body: any, statusCode?: number) {
    response.writeHead(statusCode);
    response.end(body);
  }

  public status(response: any, statusCode: number) {
    response.statusCode = statusCode;
  }

  public end(response: any, message?: string) {
    return response.end(message);
  }

  public getHttpServer<T = any>(): T {
    return this.instance as T;
  }

  public getInstance<T = any>(): T {
    return this.instance as T;
  }

  public isHeadersSent(response: any): boolean {
    return response.headersSent;
  }

  public setHeader(response: any, name: string, value: string) {
    return response.setHeader(name, value);
  }

  public getHeader(response: any, name: string): string {
    return response.getHeader(name);
  }

  public appendHeader(response: any, name: string, value: string) {
    return response.appendHeader(name, value);
  }

  public getRequestMethod(request: any): string {
    return request.method;
  }

  public getRequestUrl(request: any): string {
    return request.url;
  }

  public getRequestHostname(request: any): string {
    return request.hostname;
  }

  public createMiddlewareFactory(
    requestMethod: RequestMethod
  ): (path: string, callback: Function) => any {
    return this.routerMethodFactory
      .get(this.instance, requestMethod)
      .bind(this.instance);
  }

  public getType(): string {
    return 'azure-http';
  }

  public applyVersionFilter(
    handler: Function,
    version: VersionValue,
    versioningOptions: VersioningOptions
  ) {
    throw new NotImplementedException();
    return (req, res, next) => {
      return () => {};
    };
  }

  public listen(port: any, ...args: any[]) {}
  public render(response: any, view: string, options: any) {}
  public redirect(response: any, statusCode: number, url: string) {}
  public close() {}
  public initHttpServer() {}
  public useStaticAssets(options: any) {}
  public setViewEngine(options: any) {}
  public registerParserMiddleware() {}
  public setNotFoundHandler(handler: Function) {}
  public setErrorHandler(handler: Function) {}
}
