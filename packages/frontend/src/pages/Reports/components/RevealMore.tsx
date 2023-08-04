import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';

interface RevealMoreProps {
  content: string;
  maxHeight: string;
}

const RevealMore: React.FC<RevealMoreProps> = ({ content }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const rows = content.split('\n');

  const toggleExpand = (): void => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div>
      <div
        className={`${isExpanded ? 'h-auto' : 'max-h-[200px]'} overflow-hidden`}
      >
        <pre>{rows.map((row) => `${row}\n`)}</pre>
      </div>
      {rows.length > 10 && (
        <Button onClick={toggleExpand} className="mt-5">
          {isExpanded ? 'Show less' : 'Show more'}
        </Button>
      )}
    </div>
  );
};

export default RevealMore;
