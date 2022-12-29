import { Model } from 'mongoose';
import { PaginationModel, PaginationOptions } from 'mongoose-paginate-ts';
import { PeriodDocument } from '../schemas/periods.schema';

export interface PaginatedPeriodModel extends Model<PeriodDocument> {
  getLatest: () => Promise<PeriodDocument>;
  paginate(
    options?: PaginationOptions | undefined,
  ): Promise<PaginationModel<PeriodDocument> | undefined>;
}
