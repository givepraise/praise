/* eslint-disable @typescript-eslint/ban-types */

import { cookieProps } from '@shared/constants';
import jsonwebtoken, { VerifyErrors } from 'jsonwebtoken';
import randomString from 'randomstring';

export interface ClientData {
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
        err ? reject(err) : resolve(token || '');
      });
    });
  }

  /**
   * Decrypt JWT and extract client data.
   *
   * @param jwt
   */
  public decodeJwt(jwt: string): Promise<ClientData> {
    return new Promise((res, rej) => {
      jsonwebtoken.verify(
        jwt,
        this.secret,
        (err: VerifyErrors | null, decoded?: object) => {
          return err ? rej(this.VALIDATION_ERROR) : res(decoded as ClientData);
        }
      );
    });
  }
}
