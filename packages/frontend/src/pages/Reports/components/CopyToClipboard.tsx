import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-hot-toast';
import { Button } from '../../../components/ui/Button';

interface CopyToClipboardProps {
  text: string;
}

const CopyToClipboard: React.FC<CopyToClipboardProps> = ({ text }) => {
  const handleCopy = (): void => {
    const copy = async (): Promise<void> => {
      try {
        await navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
      } catch (err) {
        console.error('Failed to copy text: ', err);
        toast.error('Failed to copy text');
      }
    };
    void copy();
  };

  return (
    <Button onClick={handleCopy} variant="round">
      <FontAwesomeIcon icon={faCopy} />
    </Button>
  );
};

export default CopyToClipboard;
