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
import { UserPopover } from '@/components/user/UserPopover';
import { UserName } from '@/components/user/UserName';

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
        <div className="flex items-start pt-[2px] text-3xl mr-3">
          <UserPopover
            userAccount={praise.giver}
            className="w-8"
            usePseudonym={usePseudonyms}
          >
            <UserAvatar
              userAccount={praise.giver}
              usePseudonym={usePseudonyms}
            />
          </UserPopover>
        </div>
        <div className="overflow-hidden">
          <div className="flex w-full">
            <ForwarderTooltip praise={praise} />
            <UserPopover
              userAccount={praise.giver}
              usePseudonym={usePseudonyms}
            >
              <div className="flex items-center pr-2 font-bold">
                {usePseudonyms && periodId ? (
                  <UserPseudonym
                    userId={praise.giver._id}
                    periodId={periodId}
                  />
                ) : (
                  <UserName userAccount={praise.giver} />
                )}
              </div>
            </UserPopover>
            {showReceiver && (
              <>
                <div className="flex items-center pr-2">→</div>
                <UserPopover
                  userAccount={praise.receiver}
                  usePseudonym={usePseudonyms}
                >
                  <div className="flex whitespace-nowrap">
                    <div className="flex items-center pr-2 font-bold">
                      <UserAvatar
                        userAccount={praise.receiver}
                        usePseudonym={usePseudonyms}
                      />
                    </div>
                    <div className="flex items-center pr-2 font-bold">
                      <UserName userAccount={praise.receiver} />
                    </div>
                  </div>
                </UserPopover>
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
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
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
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
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
