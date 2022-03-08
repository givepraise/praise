import { UnauthorizedError } from '@error/errors';
import { sign, verify, JwtPayload } from 'jsonwebtoken';
import randomString from 'randomstring';

export interface ClientData {
  userId: string;
  ethereumAddress: string;
  roles: string[];
  isRefresh?: boolean;
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
   * Verify jwt and return decoded data, or throw error
   *
   * @param jwt
   */
  private _verifyOrFail(jwt: string): JwtPayload {
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
  public getJwt(data: ClientData): Jwt {
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
  public refreshJwt(jwt: string): Jwt {
    const decoded = this._verifyOrFail(jwt);

    if (!decoded.isRefresh) throw new UnauthorizedError(this.VALIDATION_ERROR);

    // Generate new tokens, extending access token's expiration time by JWT_ACCESS_EXP
    const accessToken = sign(
      {
        ...decoded,
        isRefresh: false,
      } as ClientData,
      this.secret,
      {
        expiresIn: Number(decoded.exp) + Number(this.accessExpiresIn),
      }
    );

    const refreshToken = sign(decoded as ClientData, this.secret, {
      expiresIn: this.refreshExpiresIn,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
