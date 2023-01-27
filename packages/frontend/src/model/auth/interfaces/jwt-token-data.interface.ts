import { TokenData } from './token-data.interface';

export interface JwtTokenData extends TokenData {
  sub: string;
  iat: number;
  exp: number;
}
