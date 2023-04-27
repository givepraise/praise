import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../../../components/ui/Button';

interface DownloadToFileProps {
  text: string;
  filename: string;
}

const DownloadToFile: React.FC<DownloadToFileProps> = ({ text, filename }) => {
  const handleDownload = (): void => {
    const fileBlob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(fileBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button onClick={handleDownload} variant="round">
      <FontAwesomeIcon icon={faDownload} />
    </Button>
  );
};

export default DownloadToFile;
