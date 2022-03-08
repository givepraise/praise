import { QueryInput } from '@shared/types';

export interface AuthRequestInput {
  ethereumAddress: string;
  message: string;
  signature: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  ethereumAddress: string;
  tokenType: string;
}

export interface NonceRequestInput extends QueryInput {
  ethereumAddress?: string;
}

export interface NonceResponse {
  ethereumAddress: string;
  nonce: string;
}

export interface RefreshRequestInput {
  refreshToken: string;
}
