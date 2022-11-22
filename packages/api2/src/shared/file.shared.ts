import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { UploadedFile } from 'express-fileupload';
import { randomString } from './random.shared';
import mime from 'mime-types';
import { unlink } from 'fs/promises';

const uploadDirectory =
  process.env.NODE_ENV === 'production' ? '/usr/src/uploads/' : 'uploads/';

function isJpg(buffer: Uint8Array): boolean {
  if (!buffer || buffer.length < 3) {
    return false;
  }

  return buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255;
}

function isPng(buffer: Uint8Array): boolean {
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

export const upload = async (req: Request, key: string): Promise<string> => {
  const file = req.files;

  if (!file) {
    throw new BadRequestException('Uploaded file is missing.');
  }

  const logo: UploadedFile = file[key] as UploadedFile;
  const chunk = logo.data.slice(0, 8);

  if (!isJpg(chunk) && !isPng(chunk)) {
    throw new BadRequestException('Uploaded file is not a valid image.');
  }

  const fileExtension: string = mime.extension(logo.mimetype) as string;
  const filename = `${randomString()}.${fileExtension}`;
  const path = `${uploadDirectory}${filename}`;
  await logo.mv(path);
  return filename;
};

export const removeFile = async (filename: string): Promise<void> => {
  try {
    await unlink(`${uploadDirectory}${filename}`);
  } catch (e) {
    // logger.warn(`Could not find a file to remove: ${filename}`);
  }
};
