import jwtDecode from 'jwt-decode';

export interface JWT {
  sub: string;
  userId: string;
  ethereumAddress: string;
  roles: string[];
  iat: number;
  exp: number;
}

export const isExpired = (jwt: string): Boolean => {
  const decoded: JWT = jwtDecode(jwt);
  const currentDatetimeSeconds = new Date().getTime() / 1000;

  return currentDatetimeSeconds >= decoded.exp;
};
