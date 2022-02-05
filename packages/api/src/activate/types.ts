import { Request } from 'express';

//TODO don't extend Request
export interface ActivateRequestBody extends Request {
  body: {
    ethereumAddress: string;
    accountId: string;
    message: string;
    signature: string;
  };
}
