import { QueryInput } from '@shared/inputs';

export interface AuthRequestBody {
  ethereumAddress: string;
  message: string;
  signature: string;
}

export interface AuthResponse {
  accessToken: string;
  ethereumAddress: string;
  tokenType: string;
}

export interface NonceQuery extends QueryInput {
  ethereumAddress: string;
}

export interface NonceResponse {
  ethereumAddress: string;
  nonce: string;
}
