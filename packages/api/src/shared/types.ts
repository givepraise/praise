import { Request, Response } from 'express';
import * as core from 'express-serve-static-core';
import { Send } from 'express-serve-static-core';
import { QueryInput } from 'types/dist/query/types';

export type Query = core.Query;
export type Params = core.ParamsDictionary;

export interface QueryInputParsedQs extends QueryInput, Query { }

export interface SearchQueryInput extends QueryInput {
  search?: string;
}

export interface SearchQueryInputParsedQs extends SearchQueryInput, Query { }

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
