import UserModel from '@entities/User';
import { ethers } from 'ethers';
import { Request, Response } from 'express';
import { sign } from 'jsonwebtoken';
import randomstring from 'randomstring';

const nonce = async (req: Request, res: Response): Promise<any> => {
  const { ethereumAddress } = req.query;
  const nonce = randomstring.generate();

  let user = await UserModel.findOneAndUpdate(
    { ethereumAddress },
    { nonce },
    { upsert: true, new: true },
  );

  return res.status(200).json({
    ethereumAddress,
    nonce,
  });
};

const generateLoginMessage = (
  account: string | undefined,
  nonce: string,
): string => {
  return (
    'SIGN THIS MESSAGE TO LOGIN TO PRAISE.\n\n' +
    `ADDRESS:\n${account}\n\n` +
    `NONCE:\n${nonce}`
  );
};

const auth = async (req: Request, res: Response): Promise<any> => {
  const { ethereumAddress, signature } = req.body as any;

  const queryResult = (await UserModel.findOne({ ethereumAddress })
    .select('nonce')
    .exec()) as any;

  if (!queryResult) throw new Error('User not found.');

  // TODO Interface for User
  const generatedMsg = generateLoginMessage(
    ethereumAddress,
    queryResult.nonce,
  );

  const verifiedAddress = ethers.utils.verifyMessage(
    generatedMsg,
    signature,
  );

  if (verifiedAddress !== ethereumAddress)
    throw new Error('Verification failed.');

  const accessToken = sign(
    {
      data: ethereumAddress,
      // TODO Role handling etc here
    },
    'secret', // TODO real secret here
    { expiresIn: 60 * 60 },
  );

  return res.status(200).json({
    accessToken,
    ethereumAddress,
    tokenType: 'Bearer',
  });
};

export default { nonce, auth };
