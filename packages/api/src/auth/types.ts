import { QueryInput } from '@shared/types';

export interface AuthRequestInput {
  ethereumAddress: string;
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

export interface TokenSet {
  accessToken: string;
  refreshToken: string;
}

export interface TokenData {
  userId: string;
  ethereumAddress: string;
  roles: string[];
  isRefresh?: boolean;
}

export interface JwtTokenData extends TokenData {
  sub: string;
  iat: number;
  exp: number;
}
