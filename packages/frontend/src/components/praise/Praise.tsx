import { localizeAndFormatIsoDate } from '@/utils/date';
import getMarkdownText from '@/components/MarkdownText';
import { ForwarderTooltip } from '@/components/praise/ForwarderTooltip';
import { UserAvatar } from '@/components/user/UserAvatar';
import { PraiseDto } from 'api/dist/praise/types';

interface Params {
  praise: PraiseDto | undefined;
}

const Praise = ({ praise }: Params): JSX.Element | null => {
  if (!praise) return null;

  return (
    <div className="flex items-center w-full">
      <div className="flex items-center">
        <UserAvatar userAccount={praise.giver} />
      </div>
      <div className="flex-grow p-3 overflow-hidden">
        <div>
          <ForwarderTooltip praise={praise} />
          <span className="font-bold">{praise.giver.name}</span> to{' '}
          <span className="font-bold">{praise.receiver.name}</span>
          <span className="ml-2 text-xs text-gray-500">
            {localizeAndFormatIsoDate(praise.createdAt)}
          </span>
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
