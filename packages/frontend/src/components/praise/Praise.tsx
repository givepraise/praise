import { DATE_FORMAT_LONG_NAME, localizeAndFormatIsoDate } from '@/utils/date';
import getMarkdownText from '@/components/MarkdownText';
import { ForwarderTooltip } from '@/components/praise/ForwarderTooltip';
import { UserAvatar } from '@/components/user/UserAvatar';
import { PraiseDto } from 'api/dist/praise/types';
import ReactTooltip from 'react-tooltip';
import { formatRelative } from 'date-fns';
import { Tooltip } from '@mui/material';

interface Params {
  praise: PraiseDto | undefined;
  className?: string;
}

const Praise = ({ praise, className = '' }: Params): JSX.Element | null => {
  if (!praise) return null;

  return (
    <div className={`flex items-center w-full ${className}`}>
      <div className="flex items-center">
        <UserAvatar userAccount={praise.giver} />
      </div>
      <div className="flex-grow p-3 overflow-hidden">
        <div>
          <ForwarderTooltip praise={praise} />
          <span className="font-bold">{praise.giver.name}</span> to{' '}
          <span className="font-bold">{praise.receiver.name}</span>
          <Tooltip
            placement="top-start"
            title={localizeAndFormatIsoDate(
              praise.createdAt,
              DATE_FORMAT_LONG_NAME
            )}
            arrow
          >
            <span className="ml-2 text-xs text-gray-500">
              {formatRelative(new Date(praise.createdAt), new Date())}
            </span>
          </Tooltip>
        </div>

        <div
          className="w-full"
          dangerouslySetInnerHTML={{
            __html: getMarkdownText(praise.reason),
          }}
        ></div>
      </div>
    </div>
  );
};

export default Praise;
