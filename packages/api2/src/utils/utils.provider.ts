import { ServiceException } from '@/shared/service-exception';
import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { Request } from 'express';
import { UploadedFile } from 'express-fileupload';
import { unlink } from 'fs/promises';
import mime from 'mime-types';

@Injectable()
export class UtilsProvider {
  private uploadDirectory =
    process.env.NODE_ENV === 'production' ? '/usr/src/uploads/' : 'uploads/';

  randomString(bytes = 10): string {
    return randomBytes(bytes).toString('hex');
  }

  isJpg(buffer: Uint8Array): boolean {
    if (!buffer || buffer.length < 3) {
      return false;
    }

    return buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255;
  }

  isPng(buffer: Uint8Array): boolean {
    if (!buffer || buffer.length < 8) {
      return false;
    }

    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    );
  }

  upload = async (req: Request, key: string): Promise<string> => {
    const file = req.files;

    if (!file) {
      throw new ServiceException('Uploaded file is missing.');
    }

    const logo: UploadedFile = file[key] as UploadedFile;
    const chunk = logo.data.slice(0, 8);

    if (!this.isJpg(chunk) && !this.isPng(chunk)) {
      throw new ServiceException('Uploaded file is not a valid image.');
    }

    const randomString = await this.randomString();
    const fileExtension: string = mime.extension(logo.mimetype) as string;
    const filename = `${randomString}.${fileExtension}`;
    const path = `${this.uploadDirectory}${filename}`;
    await logo.mv(path);
    return filename;
  };

  removeFile = async (filename: string): Promise<void> => {
    try {
      await unlink(`${this.uploadDirectory}${filename}`);
    } catch (e) {
      // logger.warn(`Could not find a file to remove: ${filename}`);
    }
  };
}
