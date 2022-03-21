import { UnauthorizedError } from '@error/errors';
import { getRandomString } from '@shared/functions';
import { sign, verify, JwtPayload } from 'jsonwebtoken';
import { TokenSet } from './types';
export interface ClientData {
  userId: string;
  ethereumAddress: string;
  roles: string[];
  isRefresh?: boolean;
}

interface JwtOptions {
  expiresIn: number;
}

export class JwtService {
  private readonly secret: string;
  private readonly VALIDATION_ERROR = 'JSON-web-token validation failed.';
  private readonly refreshExpiresIn: number;
  private readonly accessExpiresIn: number;

  constructor() {
    this.secret = process.env.JWT_SECRET || getRandomString(100);
    this.accessExpiresIn = Number(process.env.JWT_ACCESS_EXP) || 3600;
    this.refreshExpiresIn = Number(process.env.JWT_REFRESH_EXP) || 259200;
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
   * Verify jwt and return decoded data, or throw error
   *
   * @param jwt
   */
  public verifyOrFail(jwt: string): JwtPayload {
    try {
      const decoded: JwtPayload = verify(jwt, this.secret) as JwtPayload;
      return decoded;
    } catch (err) {
      throw new UnauthorizedError(this.VALIDATION_ERROR);
    }
  }

  /**
   * Encrypt data and return jwt.
   *
   * @param data
   */
  public getJwt(data: ClientData): TokenSet {
    const accessToken = this._signOrFail(data, {
      expiresIn: this.accessExpiresIn,
    });
    const refreshToken = this._signOrFail(
      {
        ...data,
        isRefresh: true,
      },
      {
        expiresIn: this.refreshExpiresIn,
      }
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Decrypt refresh JWT, create new access JWT with extended expiration,
   *  create new refresh JWT with same expiration, and return both new JWTs
   *
   * @param jwt
   */
  public refreshJwt(jwt: string): TokenSet {
    const decoded = this.verifyOrFail(jwt);
    if (!decoded.isRefresh) throw new UnauthorizedError(this.VALIDATION_ERROR);

    // Clear generated data from old refresh token
    const refreshTokenExpirationTimestamp = Number(decoded.exp);
    delete decoded.iat;
    delete decoded.exp;
    delete decoded.nbf;
    delete decoded.jti;

    // Generate new access token, with extended expiration of JWT_ACCESS_EXP
    const accessToken = sign(
      {
        ...decoded,
        isRefresh: false,
      } as ClientData,
      this.secret,
      {
        expiresIn: Number(this.accessExpiresIn),
      }
    );

    // Generate new refresh token, with same expiration timestamp
    const currentTimestamp = new Date().getTime() / 1000;
    const expiresIn = Math.ceil(
      refreshTokenExpirationTimestamp - currentTimestamp
    );
    const refreshToken = sign(decoded as ClientData, this.secret, {
      expiresIn,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
