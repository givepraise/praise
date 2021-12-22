import { Request, Response } from 'express';
import PeriodModel from '@entities/Period';

// get periods
const getPeriods = async (req: Request, res: Response): Promise<any> => {
  const periods = await PeriodModel.find({});
  // return response
  return res.status(200).json(periods);
};

export default { getPeriods };
