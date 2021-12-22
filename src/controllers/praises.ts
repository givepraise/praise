import { Request, Response } from 'express';
import PraiseModel from '@entities/Praise';

// get praises
const getPraises = async (req: Request, res: Response): Promise<any> => {
  const praises = await PraiseModel.find({});
  // return response
  return res.status(200).json(praises);
};

export default { getPraises };
