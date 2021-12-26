import UserModel from '@entities/User';
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
  if (!queryResult) throw new Error('User not found.');

  // Generate expected message, nonce included.
  // Recover signer from generated message + signature
  const generatedMsg = generateLoginMessage(ethereumAddress, queryResult.nonce);
  const signerAddress = ethers.utils.verifyMessage(generatedMsg, signature);
  if (signerAddress !== ethereumAddress)
    throw new Error('Verification failed.');

  // Generate access token
  const user = await UserModel.findOne({ ethereumAddress });
  if (!user) throw new Error('User not found.');

  const accessToken = await jwtService.getJwt({
    ethereumAddress,
    roles: user.roles,
  });

  // Save access token
  UserModel.findOneAndUpdate({ ethereumAddress }, { accessToken });

  return res.status(200).json({
    accessToken,
    ethereumAddress,
    tokenType: 'Bearer',
  } as AuthResponse);
}

export default auth;
