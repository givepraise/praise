import { QueryInput } from '@/shared/types';

export interface AuthRequestInput {
  identityEthAddress: string;
  signature: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  identityEthAddress: string;
  tokenType: string;
}

export interface NonceRequestInput extends QueryInput {
  identityEthAddress?: string;
}

export interface NonceResponse {
  identityEthAddress: string;
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
  identityEthAddress: string;
  roles: string[];
  isRefresh?: boolean;
}

export interface JwtTokenData extends TokenData {
  sub: string;
  iat: number;
  exp: number;
}
