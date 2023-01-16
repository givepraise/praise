import { Tooltip } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { useRecoilValue } from 'recoil';
import { useHistory } from 'react-router-dom';
import { getMarkdownText } from '@/utils/parser';
import { ForwarderTooltip } from '@/components/praise/ForwarderTooltip';
import { UserAvatar } from '@/components/user/UserAvatar';
import { InlineLabel } from '@/components/ui/InlineLabel';
import { classNames } from '@/utils/index';
import {
  localizeAndFormatIsoDate,
  localizeAndFormatIsoDateRelative,
  DATE_FORMAT_LONG_NAME,
} from '@/utils/date';
import { SinglePeriodByDate } from '@/model/periods/periods';
import { HasRole, ROLE_ADMIN } from '@/model/auth';
import { UserPopover } from '@/components/user/UserPopover';
import { UserName } from '@/components/user/UserName';
import { useQuantifyPraise } from '@/model/praise';
import { SourceName } from './SourceName';
import { UserAvatarAndName } from '../user/UserAvatarAndName';
import { InlineLabelClosable } from '../ui/InlineLabelClosable';
import { UserAccountDto } from '@/model/useraccount/useraccount.dto';
import { PraiseDto } from '@/model/praise/praise.dto';
import { idLabel } from '@/model/praise/praise.utils';

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

export const Praise = ({
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
  const { quantify } = useQuantifyPraise();
  const history = useHistory();

  const handleUserClick =
    (userAccount: UserAccountDto | undefined) =>
    (event: React.MouseEvent<HTMLTableRowElement>) => {
      event.stopPropagation();

      const userId =
        userAccount && typeof userAccount.user === 'object'
          ? userAccount.user._id
          : (userAccount?.user as string);

      if (userId) {
        history.push(`/users/${userId}`);
      }
    };

  if (!praise) return null;
  if (usePseudonyms && !periodId) return null;

  return (
    <div className="w-full">
      <div className={classNames(className, 'flex')}>
        {bigGiverAvatar && (
          <div
            className="flex items-start pt-[2px] text-3xl mr-3 cursor-pointer"
            onClickCapture={handleUserClick(praise.giver)}
          >
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
              <div
                className="cursor-pointer"
                onClickCapture={handleUserClick(praise.giver)}
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
              </div>
            </UserPopover>
            {showReceiver && (
              <>
                <div className="flex items-center px-2">→</div>
                <div
                  className="cursor-pointer"
                  onClickCapture={handleUserClick(praise.receiver)}
                >
                  <UserAvatarAndName
                    userAccount={praise.receiver}
                    usePseudonym={usePseudonyms}
                    periodId={periodId}
                    nameClassName="font-bold"
                  />
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
              <div className="items-center hidden pl-2 text-xs text-warm-gray-500 md:flex dark:text-warm-gray-400">
                {localizeAndFormatIsoDateRelative(praise.createdAt)}
              </div>
            </Tooltip>
          </div>
          <div className="w-full pb-2 cursor-pointer">
            {showIdPrefix && (
              <InlineLabel
                text={idLabel(praise._id)}
                className="bg-warm-gray-400"
              />
            )}
            {dismissed && (
              <InlineLabelClosable
                text="Dismissed"
                className="bg-red-600"
                onClose={(): void => void quantify(praise._id, 0, false, null)}
              />
            )}
            {shortDuplicatePraiseId && (
              <InlineLabelClosable
                text={`Duplicate of: #${shortDuplicatePraiseId}`}
                className="bg-warm-gray-700"
                onClose={(): void => void quantify(praise._id, 0, false, null)}
              />
            )}
            <span
              dangerouslySetInnerHTML={{
                __html: getMarkdownText(praise.reason),
              }}
              className={classNames(
                dismissed ? 'line-through' : '',
                shortDuplicatePraiseId ? 'text-warm-gray-400' : '',
                'break-words'
              )}
            ></span>
          </div>
          <div className="flex items-center pb-2 text-xs text-warm-gray-500 md:hidden dark:text-warm-gray-400">
            {localizeAndFormatIsoDateRelative(praise.createdAt)}
          </div>
          <div className="flex items-center text-xs text-warm-gray-500 dark:text-warm-gray-400">
            {showScore && period && (period.status === 'CLOSED' || isAdmin) && (
              <>
                <FontAwesomeIcon
                  icon={faStar}
                  size="1x"
                  className="mr-1 text-yellow-400"
                  color=""
                />
                {praise.score}
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
