import { Request } from 'express';

export interface AuthRequest extends Request {
  body: {
    ethereumAddress: string;
    message: string;
    signature: string;
  };
}

export interface AuthResponse {
  accessToken: string;
  ethereumAddress: string;
  tokenType: string;
}

export interface NonceRequest extends Request {
  query: {
    ethereumAddress: string;
  };
}

export interface NonceResponse {
  ethereumAddress: string;
  nonce: string;
}
