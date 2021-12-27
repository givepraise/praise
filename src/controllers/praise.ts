import PraiseModel from '@entities/Praise';
import { Request, Response } from 'express';

// get praise
export const getPraise = async (req: Request, res: Response): Promise<any> => {
  const praises = await PraiseModel.find({});
  // return response
  return res.status(200).json(praises);
};
