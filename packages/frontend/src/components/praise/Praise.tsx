import { PraiseDto } from 'api/dist/praise/types';
import getMarkdownText from '@/components/MarkdownText';
import { ForwarderTooltip } from '@/components/praise/ForwarderTooltip';
import { UserAvatar } from '@/components/user/UserAvatar';
import { UserPseudonym } from '@/components/user/UserPseudonym';
import { InlineLabel } from '@/components/InlineLabel';
import { classNames } from '@/utils/index';
import {
  localizeAndFormatIsoDate,
  localizeAndFormatIsoDateRelative,
  DATE_FORMAT_LONG_NAME,
} from '@/utils/date';
import { Tooltip } from '@mui/material';
import ResetQuantificationButton from './ResetQuantificationButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { SinglePeriodByDate } from '@/model/periods';
import { useRecoilValue } from 'recoil';
import { HasRole, ROLE_ADMIN } from '@/model/auth';

const formatSourceName = (sourceName: string): string => {
  return decodeURIComponent(sourceName).replace(/:/g, ' / ');
};

interface Props {
  praise: PraiseDto;
  showIdPrefix?: boolean;
  showReceiver?: boolean;
  periodId?: string;
  usePseudonyms?: boolean;
  className?: string;
  dismissed?: boolean;
  shortDuplicatePraiseId?: string;
}

const Praise = ({
  praise,
  showIdPrefix = false,
  showReceiver = true,
  periodId = undefined,
  usePseudonyms = false,
  className = '',
  dismissed = false,
  shortDuplicatePraiseId = undefined,
}: Props): JSX.Element | null => {
  const period = useRecoilValue(SinglePeriodByDate(praise?.createdAt));
  const isAdmin = useRecoilValue(HasRole(ROLE_ADMIN));

  if (!praise) return null;
  if (usePseudonyms && !periodId) return null;

  return (
    <div className="w-full">
      <div className={`flex ${className}`}>
        <div className="flex items-start pt-[2px] pr-3 text-3xl">
          <UserAvatar userAccount={praise.giver} usePseudonym={usePseudonyms} />
        </div>
        <div className="flex-grow overflow-hidden">
          <div className="flex w-full">
            <ForwarderTooltip praise={praise} />
            <div className="flex items-center pr-2 font-bold">
              {usePseudonyms && periodId ? (
                <UserPseudonym userId={praise.giver._id} periodId={periodId} />
              ) : (
                praise.giver.name
              )}
            </div>
            {showReceiver && (
              <>
                <div className="flex items-center pr-2">→</div>
                <div className="flex items-center pr-2 font-bold">
                  <UserAvatar
                    userAccount={praise.receiver}
                    usePseudonym={usePseudonyms}
                  />
                </div>
                <div className="flex items-center pr-2 font-bold">
                  {praise.receiver.name}
                </div>
              </>
            )}
            <Tooltip
              placement="right-end"
              title={localizeAndFormatIsoDate(
                praise.createdAt,
                DATE_FORMAT_LONG_NAME
              )}
              arrow
            >
              <div className="flex items-center text-xs text-gray-500">
                {localizeAndFormatIsoDateRelative(praise.createdAt)}
              </div>
            </Tooltip>
          </div>
          <div className="w-full pb-2">
            {showIdPrefix && (
              <InlineLabel
                text={`#${praise._id.slice(-4)}`}
                className="bg-gray-400"
              />
            )}
            {dismissed && (
              <InlineLabel
                text="Dismissed"
                button={<ResetQuantificationButton praise={praise} />}
                className="bg-red-600"
              />
            )}
            {shortDuplicatePraiseId && (
              <InlineLabel
                text={`Duplicate of: #${shortDuplicatePraiseId}`}
                button={<ResetQuantificationButton praise={praise} />}
              />
            )}
            <span
              dangerouslySetInnerHTML={{
                __html: getMarkdownText(praise.reasonRealized),
              }}
              className={classNames(
                dismissed ? 'line-through' : '',
                shortDuplicatePraiseId ? 'text-gray-400' : ''
              )}
            ></span>
          </div>
          <div className="flex items-center text-xs text-gray-500">
            {period && (period.status === 'CLOSED' || isAdmin) && (
              <>
                <FontAwesomeIcon
                  icon={faStar}
                  size="1x"
                  className="pr-2 text-yellow-400"
                  color=""
                />
                {praise.scoreRealized}
                {' • '}
              </>
            )}
            {formatSourceName(praise.sourceName)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Praise;
