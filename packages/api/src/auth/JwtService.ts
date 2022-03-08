import { UnauthorizedError } from '@error/errors';
import { sign, verify } from 'jsonwebtoken';
import randomString from 'randomstring';

export interface ClientData {
  userId: string;
  ethereumAddress: string;
  roles: string[];
}

export interface Jwt {
  accessToken: string;
  refreshToken: string;
}

interface JwtOptions {
  expiresIn: string;
}

export class JwtService {
  private readonly secret: string;
  private readonly VALIDATION_ERROR = 'JSON-web-token validation failed.';
  private readonly refreshExpiresIn: string;
  private readonly accessExpiresIn: string;

  constructor() {
    this.secret = process.env.JWT_SECRET || randomString.generate(100);
    this.accessExpiresIn = process.env.JWT_ACCESS_EXP || '1h';
    this.refreshExpiresIn = process.env.JWT_REFRESH_EXP || '3d';
  }

  /**
   * Sign data and return jwt, or throw error
   *
   * @param data
   * @param options
   */
  private _signOrFail(data: ClientData, options: JwtOptions): string {
    try {
      const token = sign(data, this.secret, options);
      return token;
    } catch (err) {
      throw new UnauthorizedError(
        (err as Error).message || 'Failed to sign data for new jwt'
      );
    }
  }
  /**
   * Encrypt data and return jwt.
   *
   * @param data
   */
  public getJwt(data: ClientData): Jwt {
    const accessToken = this._signOrFail(data, {
      expiresIn: this.accessExpiresIn,
    });
    const refreshToken = this._signOrFail(data, {
      expiresIn: this.refreshExpiresIn,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Decrypt JWT and extract client data.
   *
   * @param jwt
   */
  public decodeJwt(jwt: string): Promise<ClientData> {
    return new Promise((resolve) => {
      verify(jwt, this.secret, (err, decoded) => {
        if (err) throw new UnauthorizedError(this.VALIDATION_ERROR);
        return resolve(decoded as ClientData);
      });
    });
  }
}
