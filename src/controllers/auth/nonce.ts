import UserModel from '@entities/User';
import { Request, Response } from 'express';
import randomstring from 'randomstring';

interface NonceRequest extends Request {
  query: {
    ethereumAddress: string;
  };
}

interface NonceResponse {
  ethereumAddress: string;
  nonce: string;
}

async function nonce(req: NonceRequest, res: Response): Promise<any> {
  const { ethereumAddress } = req.query;

  // Generate random nonce used for auth request
  const nonce = randomstring.generate();

  // Update existing user or create new
  let user = await UserModel.findOneAndUpdate(
    { ethereumAddress },
    { nonce },
    { upsert: true, new: true }
  );

  return res.status(200).json({
    ethereumAddress,
    nonce,
  } as NonceResponse);
}

export default nonce;
