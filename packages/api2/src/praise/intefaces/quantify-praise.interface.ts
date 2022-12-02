import { UserDocument } from '@/users/schemas/users.schema';
import { PraiseQuantificationCreateUpdateInput } from './praise-quantification-input.interface';

export interface QuantifyPraiseProps {
  id: string;
  bodyParams: PraiseQuantificationCreateUpdateInput;
  currentUser: UserDocument;
}
