import { CreateUpdateQuantification } from '@/quantifications/dto/create-update-quantification.dto';
import { Types } from 'mongoose';

export class QuantifyMultiple {
  params: CreateUpdateQuantification;
  praiseIds: Types.ObjectId[];
}
