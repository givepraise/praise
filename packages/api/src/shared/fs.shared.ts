import { join } from 'path';

export const allExportsDirPath = join(process.cwd(), 'exports');

export function exportTmpFilePath(fileName: string) {
  return join(
    allExportsDirPath,
    `${Math.random().toString(36).substring(2, 15)}-${fileName}`,
  );
}
