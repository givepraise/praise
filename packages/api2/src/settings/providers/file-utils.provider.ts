import { Injectable } from '@nestjs/common';
import { unlink } from 'fs/promises';
import { ConstantsProvider } from '../../constants/constants.provider';
import * as fs from 'fs';

@Injectable()
export class FileUtilsProvider {
  constructor(private constants: ConstantsProvider) {}

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

  isImage(file: Express.Multer.File): boolean {
    const buffer = fs.readFileSync(file.path).slice(0, 8);
    return this.isJpg(buffer) || this.isPng(buffer);
  }

  removeFile = async (filename: string): Promise<void> => {
    await unlink(`${this.constants.uploadDirectory}${filename}`);
  };
}
