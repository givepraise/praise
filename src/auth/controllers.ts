import { NotFoundError, UnauthorizedError } from '@shared/errors';
import {
  TypedRequestBody,
  TypedRequestQuery,
  TypedResponse,
} from '@shared/types';
import { UserModel } from '@user/entities';
import { UserDocument } from '@user/types';
import { ethers } from 'ethers';
import randomstring from 'randomstring';
import { JwtService } from './JwtService';
import {
  AuthRequestBody,
  AuthResponse,
  NonceQuery,
  NonceResponse,
} from './types';

const jwtService = new JwtService();

const generateLoginMessage = (
  account: string | undefined,
  nonce: string
): string => {
  return (
    'SIGN THIS MESSAGE TO LOGIN TO PRAISE.\n\n' +
    `ADDRESS:\n${account}\n\n` +
    `NONCE:\n${nonce}`
  );
};

/**
 * Description
 * @param
 */
export const auth = async (
  req: TypedRequestBody<AuthRequestBody>,
  res: TypedResponse<AuthResponse>
): Promise<TypedResponse<AuthResponse>> => {
  const { ethereumAddress, signature } = req.body;

  // Find previously generated nonce
  const queryResult = (await UserModel.findOne({ ethereumAddress })
    .select('nonce')
    .exec()) as UserDocument;
  if (!queryResult) throw new NotFoundError('User');

  // Generate expected message, nonce included.
  // Recover signer from generated message + signature
  const generatedMsg = generateLoginMessage(ethereumAddress, queryResult.nonce);
  const signerAddress = ethers.utils.verifyMessage(generatedMsg, signature);
  if (signerAddress !== ethereumAddress)
    throw new UnauthorizedError('Verification failed.');

  // Generate access token
  const user = await UserModel.findOne({ ethereumAddress });
  if (!user) throw new NotFoundError('User');

  const accessToken = await jwtService.getJwt({
    userId: user._id,
    ethereumAddress,
    roles: user.roles,
  });

  // Save access token
  await UserModel.findOneAndUpdate(
    { ethereumAddress },
    { accessToken },
    { new: true }
  );

  return res.status(200).json({
    accessToken,
    ethereumAddress,
    tokenType: 'Bearer',
  });
};

/**
 * Description
 * @param
 */
export const nonce = async (
  req: TypedRequestQuery<NonceQuery>,
  res: TypedResponse<NonceResponse>
): Promise<TypedResponse<NonceResponse>> => {
  const { ethereumAddress } = req.query;

  // Generate random nonce used for auth request
  const nonce = randomstring.generate();

  // Update existing user or create new
  await UserModel.findOneAndUpdate(
    { ethereumAddress },
    { nonce },
    { upsert: true, new: true }
  );

  return res.status(200).json({
    ethereumAddress,
    nonce,
  });
};
