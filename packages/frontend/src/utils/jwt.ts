import jwtDecode from 'jwt-decode';

export interface JWT {
  sub: string;
  userId: string;
  ethereumAddress: string;
  roles: string[];
  iat: number;
  exp: number;
}