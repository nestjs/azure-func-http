import { AzureRequest } from './azure-request';
import { AzureReply } from './azure-reply';

export function createHandlerAdapter(handler) {
  return context => {
    context.res = context.res || {};
    const req = new AzureRequest(context);
    const res = new AzureReply(context);
    handler(req, res);
  };
}
