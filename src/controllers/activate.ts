import UserModel from '@entities/User';
import UserAccountModel from '@entities/UserAccount';
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from '@shared/errors';
import { ethers } from 'ethers';
import { Request, Response } from 'express';

const generateLoginMessage = (
  accountName: string,
  ethereumAddress: string,
  token: string
): string => {
  return (
    'SIGN THIS MESSAGE TO ACTIVATE YOUR ACCOUNT.\n\n' +
    `ACCOUNT NAME:\n${accountName}\n\n` +
    `ADDRESS:\n${ethereumAddress}\n\n` +
    `TOKEN:\n${token}`
  );
};

interface ActivateRequest extends Request {
  body: {
    ethereumAddress: string;
    accountName: string;
    message: string;
    signature: string;
  };
}

export async function activate(
  req: ActivateRequest,
  res: Response
): Promise<any> {
  const { ethereumAddress, signature, accountName } = req.body;

  // Find previously generated token
  const userAccount = (await UserAccountModel.findOne({ username: accountName })
    .select('activateToken')
    .exec()) as any;

  if (!userAccount) throw new NotFoundError('UserAccount');

  // Generate expected message, token included.
  const generatedMsg = generateLoginMessage(
    accountName,
    ethereumAddress,
    userAccount.activateToken
  );

  // Verify signature against generated message
  // Recover signer and compare against query address
  const signerAddress = ethers.utils.verifyMessage(generatedMsg, signature);
  if (signerAddress !== ethereumAddress)
    throw new UnauthorizedError('Verification failed.');

  // Find user to link account to
  const user = await UserModel.findOne({ ethereumAddress }).populate(
    'accounts'
  );
  if (!user) throw new NotFoundError('User');

  // You are only allowed to activate once
  for (let account of user.accounts) {
    if (account.username === accountName)
      throw new BadRequestError('User account already activated.');
  }

  // Link user account with user
  user.accounts.push(userAccount);
  user.save();

  return res.status(200).json(user);
}
