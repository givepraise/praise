import { Request } from 'express';

export interface ActivateRequest extends Request {
  body: {
    ethereumAddress: string;
    accountId: string;
    message: string;
    signature: string;
  };
}
