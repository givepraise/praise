import { Quantification } from '@/quantifications/schemas/quantifications.schema';

export interface PeriodDetailsQuantifier {
  _id: string;
  quantifications: Array<Quantification>;
  praiseCount: number;
}
