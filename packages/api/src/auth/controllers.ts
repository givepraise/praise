import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from '@error/errors';
import {
  Query,
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
  AuthRequestInput,
  AuthResponse,
  NonceRequestInput,
  NonceResponse,
} from './types';
import { body, validationResult } from 'express-validator';

const jwtService = new JwtService();

const generateLoginMessage = (account: string, nonce: string): string => {
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
  req: TypedRequestBody<AuthRequestInput>,
  res: TypedResponse<AuthResponse>
): Promise<void> => {
  body('ethereumAddress').not().isEmpty().trim().escape();
  body('signature').not().isEmpty().trim().escape();

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError('Invalid request input format.');
  }

  const { ethereumAddress, signature } = req.body;
  if (!ethereumAddress) throw new NotFoundError('ethereumAddress');
  if (!signature) throw new NotFoundError('signature');

  // Find previously generated nonce
  const user = (await UserModel.findOne({ ethereumAddress })
    .select('nonce roles')
    .exec()) as UserDocument;
  if (!user || !user._id) throw new NotFoundError('User');
  if (!user.nonce)
    throw new BadRequestError('Noce not found. Call /api/nonce first.');

  // Generate expected message, nonce included.
  // Recover signer from generated message + signature
  const generatedMsg = generateLoginMessage(ethereumAddress, user.nonce);
  const signerAddress = ethers.utils.verifyMessage(generatedMsg, signature);
  if (signerAddress !== ethereumAddress)
    throw new UnauthorizedError('Verification failed.');

  const accessToken = await jwtService.getJwt({
    userId: user._id,
    ethereumAddress,
    roles: user.roles,
  });
  user.accessToken = accessToken;
  await user.save();

  res.status(200).json({
    accessToken,
    ethereumAddress,
    tokenType: 'Bearer',
  });
};

interface NonceRequestInputParsedQs extends Query, NonceRequestInput {}

/**
 * Description
 * @param
 */
export const nonce = async (
  req: TypedRequestQuery<NonceRequestInputParsedQs>,
  res: TypedResponse<NonceResponse>
): Promise<void> => {
  body('ethereumAddress').not().isEmpty().trim().escape();

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError('Invalid request input format.');
  }

  const { ethereumAddress } = req.query;
  if (!ethereumAddress) throw new NotFoundError('ethereumAddress');

  // Generate random nonce used for auth request
  const nonce = randomstring.generate();

  // Update existing user or create new
  await UserModel.findOneAndUpdate(
    { ethereumAddress },
    { nonce },
    { upsert: true, new: true }
  );

  res.status(200).json({
    ethereumAddress,
    nonce,
  });
};
