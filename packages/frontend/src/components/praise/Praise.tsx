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
import { AccessToken, HasRole, ROLE_ADMIN } from '@/model/auth/auth';
import { UserPopover } from '@/components/user/UserPopover';
import { UserName } from '@/components/user/UserName';
import { SourceName } from './SourceName';
import { UserAvatarAndName } from '../user/UserAvatarAndName';
import { Praise as PraiseDto } from '@/model/praise/praise.dto';
import { idLabel } from '@/model/praise/praise.utils';
import { UserAccount } from '@/model/useraccount/dto/user-account.dto';
import { SingleUser } from '../../model/user/users';
import { PraiseInlineLabelClosable } from './PraiseInlineLabelClosable';

interface Props {
  praise: PraiseDto;
  showIdPrefix?: boolean;
  showReceiver?: boolean;
  periodId?: string;
  usePseudonyms?: boolean;
  className?: string;
  dismissed?: boolean;
  shortDuplicatePraise?: string;
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
  shortDuplicatePraise = undefined,
  bigGiverAvatar = true,
  showScore = true,
}: Props): JSX.Element | null => {
  const period = useRecoilValue(SinglePeriodByDate(praise?.createdAt));
  const isAdmin = useRecoilValue(HasRole(ROLE_ADMIN));
  const history = useHistory();
  const accessToken = useRecoilValue(AccessToken);

  // This is a bit of a hack.
  // If `user` can be either a string or a User object, that
  // should be reflected in the type.
  //TODO: Refactor this.
  const giverUser = useRecoilValue(
    SingleUser(praise?.giver?.user as unknown as string)
  );
  const receiverUser = useRecoilValue(
    SingleUser(praise?.receiver?.user as unknown as string)
  );

  const handleUserClick =
    (userAccount: UserAccount | undefined) =>
    (event: React.MouseEvent<HTMLTableRowElement>) => {
      event.stopPropagation();

      if (userAccount && userAccount.user) {
        if (typeof userAccount.user === 'object') {
          history.push(`/${userAccount.user.username}`);
        } else {
          history.push(`/users/${userAccount.user}`);
        }
      }
    };

  if (!praise) return null;
  if (usePseudonyms && !periodId) return null;
  return (
    <div className="w-full ">
      <div className={classNames(className, 'flex')}>
        {bigGiverAvatar && (
          <div
            className="flex items-start pt-[2px] text-3xl mr-3 cursor-pointer"
            onClickCapture={handleUserClick(praise.giver)}
          >
            <UserPopover
              userAccount={praise.giver}
              user={giverUser}
              className="w-8"
              usePseudonym={usePseudonyms}
            >
              <UserAvatar
                userAccount={praise.giver}
                user={giverUser}
                usePseudonym={usePseudonyms}
              />
            </UserPopover>
          </div>
        )}
        <div className="overflow-hidden">
          <div className="flex w-full">
            <ForwarderTooltip praise={praise} />
            <div
              className="cursor-pointer"
              onClickCapture={handleUserClick(praise.giver)}
            >
              <UserPopover
                usePseudonym={usePseudonyms}
                userAccount={praise.giver}
                user={giverUser}
              >
                {bigGiverAvatar ? (
                  <UserName
                    userAccount={praise.giver}
                    user={giverUser}
                    usePseudonym={usePseudonyms}
                    periodId={periodId}
                    className="font-bold"
                  />
                ) : (
                  <UserAvatarAndName
                    userAccount={praise.giver}
                    user={giverUser}
                    usePseudonym={usePseudonyms}
                    periodId={periodId}
                    nameClassName="font-bold"
                  />
                )}
              </UserPopover>
            </div>
            {showReceiver && (
              <>
                <div className="flex items-center px-2">→</div>
                <div
                  className="cursor-pointer"
                  onClickCapture={handleUserClick(praise.receiver)}
                >
                  <UserAvatarAndName
                    userAccount={praise.receiver}
                    user={receiverUser}
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
              <div className="items-center hidden pl-2 text-xs text-warm-gray-500 @lg:flex dark:text-warm-gray-400">
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
            {dismissed && accessToken && (
              <PraiseInlineLabelClosable
                praise={praise}
                dismissed={dismissed}
              />
            )}
            {shortDuplicatePraise && accessToken && (
              <PraiseInlineLabelClosable
                praise={praise}
                shortDuplicatePraise={shortDuplicatePraise}
              />
            )}
            <span
              dangerouslySetInnerHTML={{
                __html: getMarkdownText(praise.reason),
              }}
              className={classNames(
                dismissed ? 'line-through' : '',
                shortDuplicatePraise ? 'text-warm-gray-400' : '',
                'break-words'
              )}
            ></span>
          </div>
          <div className="flex items-center pb-2 text-xs text-warm-gray-500 dark:text-warm-gray-400 @lg:hidden">
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
