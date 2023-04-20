import { join } from 'path';
import { isDocker } from './isDocker';

const allExportsDirPath = isDocker()
  ? '/usr/src/exports/'
  : join(__dirname, '../../../exports');

export function exportTmpFilePath(fileName: string) {
  return join(
    allExportsDirPath,
    `${Math.random().toString(36).substring(2, 15)}-${fileName}`,
  );
}
