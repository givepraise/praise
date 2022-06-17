import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDiscord,
  faTelegram,
  IconDefinition,
} from '@fortawesome/free-brands-svg-icons';
import React from 'react';

interface SourceNameProps {
  sourceName: string;
}

const WrappedSourceName = ({ sourceName }: SourceNameProps): JSX.Element => {
  const s = decodeURIComponent(sourceName).split(':');
  if (!Array.isArray(s) || s.length < 3) {
    return <div>{sourceName}</div>;
  }

  let icon: IconDefinition | undefined;
  if (s[0] === 'DISCORD') {
    icon = faDiscord;
  }
  if (s[0] === 'TELEGRAM') {
    icon = faTelegram;
  }

  return (
    <div>
      {icon ? <FontAwesomeIcon icon={icon} className="mx-1" /> : <>{s[0]}</>}
      {'• '}
      {s[2]}
    </div>
  );
};

export const SourceName = React.memo(WrappedSourceName);
