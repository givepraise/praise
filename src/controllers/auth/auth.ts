import UserModel from '@entities/User';
import { NotFoundError, UnauthorizedError } from '@shared/errors';
import { JwtService } from '@shared/JwtService';
import { ethers } from 'ethers';
import { Request, Response } from 'express';

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

interface AuthRequest extends Request {
  body: {
    ethereumAddress: string;
    message: string;
    signature: string;
  };
}

interface AuthResponse {
  accessToken: string;
  ethereumAddress: string;
  tokenType: string;
}

async function auth(req: AuthRequest, res: Response): Promise<any> {
  const { ethereumAddress, signature } = req.body;

  // Find previously generated nonce
  const queryResult = (await UserModel.findOne({ ethereumAddress })
    .select('nonce')
    .exec()) as any;
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
  } as AuthResponse);
}

export default auth;
