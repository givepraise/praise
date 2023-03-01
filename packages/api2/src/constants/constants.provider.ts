import { Injectable } from '@nestjs/common';

export const uploadDirectory =
  process.env.NODE_ENV === 'production' ? '/usr/src/uploads/' : 'uploads/';

@Injectable()
export class ConstantsProvider {
  public uploadDirectory = uploadDirectory;
}
