/* eslint-disable @typescript-eslint/ban-types */

import { cookieProps } from '@shared/constants';
import jsonwebtoken, { VerifyErrors } from 'jsonwebtoken';
import randomString from 'randomstring';
import { UnauthorizedError } from '../shared/errors';

export interface ClientData {
  userId: string;
  ethereumAddress: string;
  roles: string[];
}

interface JwtOptions {
  expiresIn: string;
}

export class JwtService {
  private readonly secret: string;
  private readonly options: JwtOptions;
  private readonly VALIDATION_ERROR = 'JSON-web-token validation failed.';

  constructor() {
    this.secret = process.env.JWT_SECRET || randomString.generate(100);
    this.options = { expiresIn: cookieProps.options.maxAge.toString() };
  }

  /**
   * Encrypt data and return jwt.
   *
   * @param data
   */
  public getJwt(data: ClientData): Promise<string> {
    return new Promise((resolve, reject) => {
      jsonwebtoken.sign(data, this.secret, this.options, (err, token) => {
        if (err) throw new UnauthorizedError(err);
        return resolve(token || '');
      });
    });
  }

  /**
   * Decrypt JWT and extract client data.
   *
   * @param jwt
   */
  public decodeJwt(jwt: string): Promise<ClientData> {
    return new Promise((res) => {
      jsonwebtoken.verify(
        jwt,
        this.secret,
        (err: VerifyErrors | null, decoded?: object) => {
          if (err) throw new UnauthorizedError(this.VALIDATION_ERROR);
          return res(decoded as ClientData);
        }
      );
    });
  }
}
