import { randomBytes } from 'crypto';
import multer from 'multer';
import { uploadDirectory } from '../../constants/constants.provider';

export const upploadStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDirectory);
  },
  filename: function (req, file, cb) {
    const fileEnding = file.originalname.split('.').pop();
    const fileName = randomBytes(10).toString('hex');
    cb(null, `${fileName}.${fileEnding}`);
  },
});
