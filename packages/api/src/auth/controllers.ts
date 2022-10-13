import { ethers } from 'ethers';
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from '@/error/errors';
import { getRandomString } from '@/shared/functions';
import {
  Query,
  TypedRequestBody,
  TypedRequestQuery,
  TypedResponse,
} from '@/shared/types';
import { UserModel } from '@/user/entities';
import { UserDocument } from '@/user/types';
import { EventLogTypeKey } from '@/eventlog/types';
import { logEvent } from '@/eventlog/utils';
import { JwtService } from './JwtService';
import {
  AuthRequestInput,
  AuthResponse,
  NonceRequestInput,
  NonceResponse,
  RefreshRequestInput,
  TokenSet,
} from './types';
import { generateLoginMessage } from './utils';

const jwtService = new JwtService();

/**
 * Authenticate a user with a signed message from their ethereum address
 *
 * @param  {TypedRequestBody<AuthRequestInput>} req
 * @param  {TypedResponse<AuthResponse>} res
 * @returns Promise
 */
export const auth = async (
  req: TypedRequestBody<AuthRequestInput>,
  res: TypedResponse<AuthResponse>
): Promise<void> => {
  const { identityEthAddress, signature } = req.body;
  if (!identityEthAddress) throw new NotFoundError('identityEthAddress');
  if (!signature) throw new NotFoundError('signature');

  // Find previously generated nonce
  const user = (await UserModel.findOne({ identityEthAddress })
    .select('nonce roles')
    .exec()) as UserDocument;
  if (!user || !user._id) throw new NotFoundError('User');
  if (!user.nonce)
    throw new BadRequestError('Nonce not found. Call /api/auth/nonce first.');

  // Generate expected message, nonce included.
  // Recover signer from generated message + signature
  const generatedMsg = generateLoginMessage(identityEthAddress, user.nonce);
  const signerAddress = ethers.utils.verifyMessage(generatedMsg, signature);
  if (signerAddress !== identityEthAddress)
    throw new UnauthorizedError('Verification failed.');

  const { accessToken, refreshToken }: TokenSet = jwtService.getJwt({
    userId: user._id,
    identityEthAddress,
    roles: user.roles,
  });
  user.accessToken = accessToken;
  user.refreshToken = refreshToken;
  await user.save();

  await logEvent(EventLogTypeKey.AUTHENTICATION, 'Logged in', {
    userId: user._id,
  });

  res.status(200).json({
    accessToken,
    refreshToken,
    identityEthAddress,
    tokenType: 'Bearer',
  });
};

interface NonceRequestInputParsedQs extends Query, NonceRequestInput {}

/**
 * Generate a nonce (random string) and store in user model
 *  to prepare the user for signing an authentication message containing that nonce
 *
 * @param  {TypedRequestQuery<NonceRequestInputParsedQs>} req
 * @param  {TypedResponse<NonceResponse>} res
 * @returns Promise
 */
export const nonce = async (
  req: TypedRequestQuery<NonceRequestInputParsedQs>,
  res: TypedResponse<NonceResponse>
): Promise<void> => {
  const { identityEthAddress } = req.query;
  if (!identityEthAddress) throw new NotFoundError('identityEthAddress');

  // Generate random nonce used for auth request
  const nonce = getRandomString();

  // Update existing user or create new
  await UserModel.findOneAndUpdate(
    { identityEthAddress },
    { nonce },
    { upsert: true, new: true }
  );

  res.status(200).json({
    identityEthAddress,
    nonce,
  });
};

/**
 * Refresh a short-lived JWT access token after authenticating with a long-lived JWT refresh token
 *
 * @param  {TypedRequestBody<RefreshRequestInput>} req
 * @param  {TypedResponse<AuthResponse>} res
 * @returns Promise
 */
export const refresh = async (
  req: TypedRequestBody<RefreshRequestInput>,
  res: TypedResponse<AuthResponse>
): Promise<void> => {
  // confirm refreshToken matches a single user.refreshToken
  const { refreshToken } = req.body;

  const user = await UserModel.findOne({ refreshToken });
  if (!user || !user._id || !user.identityEthAddress)
    throw new UnauthorizedError('Invalid refresh token');

  // confirm refreshToken provided is valid
  const jwt: TokenSet = jwtService.refreshJwt(refreshToken);

  // update user tokens
  user.accessToken = jwt.accessToken;
  user.refreshToken = jwt.refreshToken;
  await user.save();

  // return updated tokens
  res.status(200).json({
    accessToken: jwt.accessToken,
    refreshToken: jwt.refreshToken,
    identityEthAddress: user.identityEthAddress,
    tokenType: 'Bearer',
  });
};
