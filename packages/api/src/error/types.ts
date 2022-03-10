export interface ErrorCodesInterface {
  [name: string]: number;
}

export interface ErrorInterface {
  message: string;
  name: string;
}

export interface ApiErrorResponseData {
  errors?: Array<string>;
  message: string;
  name: string;
}

export type AppError = Error;
