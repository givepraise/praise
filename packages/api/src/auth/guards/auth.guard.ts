import {
  ConstantsProvider,
  HOSTNAME_TEST,
} from '../../constants/constants.provider';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthRole } from '../enums/auth-role.enum';
import * as bcrypt from 'bcrypt';
import { ApiException } from '../../shared/exceptions/api-exception';
import { errorMessages } from '../../shared/exceptions/error-messages';
import { ApiKeyService } from '../../api-key/api-key.service';
import { AuthContext } from '../auth-context';
import { Types } from 'mongoose';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../shared/decorators/public.decorator';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly apiKeyService: ApiKeyService,
    private readonly constantsProvider: ConstantsProvider,
    private reflector: Reflector,
  ) {}

  /**
   * Checks for a valid api key.
   */
  async canActivateApiKey(request: any): Promise<boolean> {
    const apiKey = request.headers['x-api-key'];
    if (!apiKey) {
      return false;
    }

    //Check if the API key has been configured in the environment variables.
    const index = this.constantsProvider.apiKeys.indexOf(apiKey);
    if (index > -1) {
      const key = this.constantsProvider.apiKeys[index];
      const role = this.constantsProvider.apiKeyRoles[index];
      request.authContext = {
        roles: [AuthRole[role as keyof typeof AuthRole]],
        apiKey: key,
      } as AuthContext;
      return true;
    }

    // Hash the API key as it is stored in the database as a hash.
    if (!this.constantsProvider.apiKeySalt) {
      throw new ApiException(errorMessages.API_KEY_SALT_NOT_SET);
    }
    const hash = await bcrypt.hash(apiKey, this.constantsProvider.apiKeySalt);

    // Check if the API key has been configured in the database.
    const key = await this.apiKeyService.findOneByHash(hash);
    if (key) {
      request.authContext = {
        roles: [key.role],
        apiKeyId: key._id,
      } as AuthContext;
      return true;
    }
    return false;
  }

  isTokenExpiredError(error: any): boolean {
    return error.name === 'TokenExpiredError';
  }

  /**
   * Checks for a valid JWT.
   */
  async canActivateJwt(request: any): Promise<boolean> {
    const authorization = request.headers.authorization;
    if (!authorization) {
      return false;
    }
    const token = authorization.split(' ')[1];
    if (!token) {
      return false;
    }
    try {
      const payload = (await this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      })) as JwtPayload;

      // Hostname in JWT payload must match hostname in request
      const expectedHostname =
        process.env.NODE_ENV === 'testing' ? HOSTNAME_TEST : request.hostname;

      if (expectedHostname !== payload.hostname || payload.type !== 'access') {
        return false;
      }

      request.authContext = {
        userId: new Types.ObjectId(payload.userId),
        identityEthAddress: payload.identityEthAddress,
        roles: payload.roles,
      } as AuthContext;
    } catch (e) {
      if (this.isTokenExpiredError(e)) {
        throw new ApiException(errorMessages.JWT_TOKEN_EXPIRED);
      }
      return false;
    }
    return true;
  }

  /**
   * Checks if the user has the required permissions to access the route.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    if (
      (await this.canActivateApiKey(request)) ||
      (await this.canActivateJwt(request))
    ) {
      return true;
    }
    throw new ApiException(errorMessages.AUTH_FAILED);
  }
}
