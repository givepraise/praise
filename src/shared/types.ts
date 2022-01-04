import * as core from 'express-serve-static-core';

export interface Query extends core.Query {}

export interface Params extends core.ParamsDictionary {}

export interface ErrorCodesInterface {
  [name: string]: number;
}

export interface ErrorInterface {
  message: string;
  name: string;
}
