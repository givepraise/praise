import UserModel from '@entities/User';
import UserAccountModel from '@entities/UserAccount';
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from '@shared/errors';
import { ethers } from 'ethers';
import { Request, Response } from 'express';

const generateLoginMessage = (
  accountId: string,
  ethereumAddress: string,
  token: string
): string => {
  return (
    'SIGN THIS MESSAGE TO ACTIVATE YOUR ACCOUNT.\n\n' +
    `ACCOUNT ID:\n${accountId}\n\n` +
    `ADDRESS:\n${ethereumAddress}\n\n` +
    `TOKEN:\n${token}`
  );
};

interface ActivateRequest extends Request {
  body: {
    ethereumAddress: string;
    accountId: string;
    message: string;
    signature: string;
  };
}

export async function activate(
  req: ActivateRequest,
  res: Response
): Promise<Response> {
  const { ethereumAddress, signature, accountId } = req.body;

  // Find previously generated token
  const userAccount = await UserAccountModel.findOne({ id: accountId })
    .select('activateToken')
    .exec();

  if (!userAccount) throw new NotFoundError('UserAccount');
  if (!userAccount.activateToken)
    throw new InternalServerError('Activation token not found.');

  // You are only allowed to activate once
  const alreadyActivated = await UserModel.findOne({ accounts: userAccount });
  if (alreadyActivated)
    throw new BadRequestError('User account already activated.');

  // Generate expected message, token included.
  const generatedMsg = generateLoginMessage(
    accountId,
    ethereumAddress,
    userAccount.activateToken
  );

  // Verify signature against generated message
  // Recover signer and compare against query address
  const signerAddress = ethers.utils.verifyMessage(generatedMsg, signature);
  if (signerAddress !== ethereumAddress)
    throw new UnauthorizedError('Verification failed.');

  // Find existing user or create new
  const user = await UserModel.findOneAndUpdate(
    { ethereumAddress },
    { ethereumAddress },
    { upsert: true, new: true }
  ).populate('accounts');
  if (!user) throw new NotFoundError('User');

  // Link user account with user
  user.accounts.push(userAccount);
  user.save();

  return res.status(200).json(user);
}
