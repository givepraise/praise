import { Request, Response } from 'express';
import * as core from 'express-serve-static-core';
import { Send } from 'express-serve-static-core';

export interface ErrorCodesInterface {
  [name: string]: number;
}

export interface ErrorInterface {
  message: string;
  name: string;
}

export type Query = core.Query;
export type Params = core.ParamsDictionary;

export interface TypedRequest<T extends Query, U> extends Request {
  body: U;
  query: T;
}

export interface TypedRequestQuery<T extends Query> extends Request {
  query: T;
}

export interface TypedRequestBody<T> extends Request {
  body: T;
}

export interface TypedResponse<ResBody> extends Response {
  json: Send<ResBody, this>;
}
