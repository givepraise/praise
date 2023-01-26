import { TokenData } from './tokean-data.interface';

export interface JwtTokenData extends TokenData {
  sub: string;
  iat: number;
  exp: number;
}
