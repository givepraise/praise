import { Request } from '@nestjs/common';
import { User } from '@/users/schemas/users.schema';
import { UploadedFile } from 'express-fileupload';

export interface RequestWithFiles extends Partial<Request> {
  files?: {
    value: UploadedFile;
  };
}
