import { localizeAndFormatIsoDate } from '@/utils/date';
import getMarkdownText from '@/components/MarkdownText';
import { ForwarderTooltip } from '@/components/praise/ForwarderTooltip';
import { UserAvatar } from '@/components/user/UserAvatar';
import { PraiseDto } from 'api/dist/praise/types';
import { UserPseudonym } from '../user/UserPseudonym';
import { InlineLabel } from '../InlineLabel';

interface Params {
  praise: PraiseDto;
  showIdPrefix?: boolean;
  showReceiver?: boolean;
  periodId?: string;
  usePseudonyms?: boolean;
  className?: string;
  contentPrefixChildren?: JSX.Element | null;
}

const Praise = ({
  praise,
  showIdPrefix = false,
  showReceiver = true,
  periodId = undefined,
  usePseudonyms = false,
  className = '',
  contentPrefixChildren = null,
}: Params): JSX.Element | null => {
  if (!praise) return null;

  if (usePseudonyms && !periodId) return null;

  return (
    <div className={`flex items-center w-full ${className}`}>
      <div className="flex items-center">
        <UserAvatar userAccount={praise.giver} usePseudonym={usePseudonyms} />
      </div>
      <div className="flex-grow p-3 overflow-hidden">
        <div>
          <ForwarderTooltip praise={praise} />
          <span className="font-bold">
            {usePseudonyms && periodId ? (
              <UserPseudonym userId={praise.giver._id} periodId={periodId} />
            ) : (
              praise.giver.name
            )}
          </span>
          {showReceiver && (
            <span>
              {' '}
              to <span className="font-bold">{praise.receiver.name}</span>
            </span>
          )}

          <span className="ml-2 text-xs text-gray-500">
            {localizeAndFormatIsoDate(praise.createdAt)}
          </span>
        </div>

        <div className="w-full">
          {showIdPrefix && (
            <InlineLabel
              text={`#${praise._id.slice(-4)}`}
              className="bg-gray-400"
            />
          )}
          {contentPrefixChildren && contentPrefixChildren}
          <span
            dangerouslySetInnerHTML={{
              __html: getMarkdownText(praise.reason),
            }}
          ></span>
        </div>
      </div>
    </div>
  );
};

export default Praise;
