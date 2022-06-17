import { PraiseDto } from 'api/dist/praise/types';
import getMarkdownText from '@/components/MarkdownText';
import { ForwarderTooltip } from '@/components/praise/ForwarderTooltip';
import { UserAvatar } from '@/components/user/UserAvatar';
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
import { UserAvatarAndName } from '../user/UserAvatarAndName';
import { SourceName } from './SourceName';

interface Props {
  praise: PraiseDto;
  showIdPrefix?: boolean;
  showReceiver?: boolean;
  periodId?: string;
  usePseudonyms?: boolean;
  className?: string;
  dismissed?: boolean;
  shortDuplicatePraiseId?: string;
  bigGiverAvatar?: boolean;
  showScore?: boolean;
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
  bigGiverAvatar = true,
  showScore = true,
}: Props): JSX.Element | null => {
  const period = useRecoilValue(SinglePeriodByDate(praise?.createdAt));
  const isAdmin = useRecoilValue(HasRole(ROLE_ADMIN));

  if (!praise) return null;
  if (usePseudonyms && !periodId) return null;

  return (
    <div className="w-full">
      <div className={classNames(className, 'flex')}>
        {bigGiverAvatar && (
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
        )}
        <div className="overflow-hidden">
          <div className="flex w-full">
            <ForwarderTooltip praise={praise} />
            <UserPopover
              userAccount={praise.giver}
              usePseudonym={usePseudonyms}
            >
              {bigGiverAvatar ? (
                <UserName
                  userAccount={praise.giver}
                  usePseudonym={usePseudonyms}
                  periodId={periodId}
                  className="font-bold"
                />
              ) : (
                <UserAvatarAndName
                  userAccount={praise.giver}
                  usePseudonym={usePseudonyms}
                  periodId={periodId}
                  nameClassName="font-bold"
                />
              )}
            </UserPopover>
            {showReceiver && (
              <>
                <div className="flex items-center px-2">→</div>
                <UserAvatarAndName
                  userAccount={praise.receiver}
                  usePseudonym={usePseudonyms}
                  periodId={periodId}
                  nameClassName="font-bold"
                />
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
              <div className="flex items-center pl-2 text-xs text-gray-500 dark:text-gray-400">
                {localizeAndFormatIsoDateRelative(praise.createdAt)}
              </div>
            </Tooltip>
          </div>
          <div className="w-full pb-2">
            {showIdPrefix && (
              <InlineLabel
                text={`#${praise._id.slice(-4)}`}
                className="bg-warm-gray-400"
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
            {showScore && period && (period.status === 'CLOSED' || isAdmin) && (
              <>
                <FontAwesomeIcon
                  icon={faStar}
                  size="1x"
                  className="mr-1 text-yellow-400"
                  color=""
                />
                {praise.scoreRealized}
                {' • '}
              </>
            )}
            <SourceName sourceName={praise.sourceName} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Praise;
