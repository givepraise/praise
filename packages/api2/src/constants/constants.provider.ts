import { Injectable } from '@nestjs/common';

@Injectable()
export class ConstantsProvider {
  public uploadDirectory =
    process.env.NODE_ENV === 'production' ? '/usr/src/uploads/' : 'uploads/';
}
