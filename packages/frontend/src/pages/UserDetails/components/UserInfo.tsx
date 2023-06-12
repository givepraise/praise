import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt,
  faScaleBalanced,
  faUserLock,
} from '@fortawesome/free-solid-svg-icons';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import { Jazzicon } from '@ukstv/jazzicon-react';
import { useRecoilValue } from 'recoil';
import { Box } from '@/components/ui/Box';
import { formatIsoDateUTC, DATE_FORMAT } from '@/utils/date';
import { Button } from '@/components/ui/Button';
import { ActiveUserId, HasRole, ROLE_ADMIN } from '@/model/auth/auth';
import { UserAvatar } from '@/components/user/UserAvatar';
import { UserWithStatsDto } from '@/model/user/dto/user-with-stats.dto';
import { UserRole } from '@/model/user/enums/user-role.enum';
import { shortenEthAddress } from '@/utils/string';
import { Bio } from './Bio';
import { UserInfoAdminRolesInput } from './UserInfoAdminRolesInput';

interface Params {
  user: UserWithStatsDto;
  isDialogOpen: (value) => void;
}

export const UserInfo = ({
  user,
  isDialogOpen,
}: Params): JSX.Element | null => {
  const isAdmin = useRecoilValue(HasRole(ROLE_ADMIN));
  const activeUserId = useRecoilValue(ActiveUserId);
  const isProfilePage = user._id === activeUserId;

  const roles = [UserRole.ADMIN, UserRole.FORWARDER, UserRole.QUANTIFIER];

  const discordAccount = user.accounts?.find((a) => a.platform === 'DISCORD');

  return (
    <Box>
      <div className="flex justify-between mb-8">
        <div className="m-3 text-8xl">
          <UserAvatar user={user} />
        </div>
        {isProfilePage && (
          <div>
            <Button onClick={(): void => isDialogOpen(true)} className="">
              Edit profile
            </Button>
          </div>
        )}
      </div>

      <div className="relative sm:flex sm:justify-between">
        <div className="">
          <h2 className="mb-5 ">
            {user.username.length < 24
              ? user.username
              : shortenEthAddress(user.username)}
          </h2>
          {discordAccount && (
            <div className="mb-2">
              <FontAwesomeIcon icon={faDiscord} className="mr-2" size="1x" />
              {discordAccount.name}
            </div>
          )}
          <div className="flex mb-2">
            <span>
              <Jazzicon
                address={shortenEthAddress(user.identityEthAddress)}
                className="w-4 h-4"
              />
            </span>
            <span className="ml-2">
              Identity address: {shortenEthAddress(user.identityEthAddress)}
            </span>
          </div>
          <div className="flex mb-2">
            <span>
              <Jazzicon
                address={shortenEthAddress(user.rewardsEthAddress)}
                className="w-4 h-4"
              />
            </span>
            <span className="ml-2">
              Rewards address: {shortenEthAddress(user.rewardsEthAddress)}
            </span>
          </div>
          {!isAdmin && (
            <div className="mb-2">
              <FontAwesomeIcon icon={faUserLock} className="mr-2" size="1x" />
              User roles:{' '}
              {user.roles.map(
                (r, index: number, array) =>
                  `${r}${array.length > index + 1 ? ', ' : ''}`
              )}
            </div>
          )}
        </div>

        <div className="sm:absolute sm:bottom-0 sm:right-0">
          {user.createdAt ? (
            <p className="mb-2">
              <FontAwesomeIcon
                icon={faCalendarAlt}
                className="mr-2"
                size="1x"
              />
              Joined: {formatIsoDateUTC(user.createdAt, DATE_FORMAT)}
            </p>
          ) : (
            ''
          )}
          <p className="mb-2">
            <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 " size="1x" />
            Latest activity: {formatIsoDateUTC(user.updatedAt, DATE_FORMAT)}
          </p>
          <p className="mb-2">
            <FontAwesomeIcon
              icon={faScaleBalanced}
              className="mr-2"
              size="xs"
            />
            <span>
              Received praise total score:{' '}
              {user.receivedTotalScore ? user.receivedTotalScore : '-'}
            </span>
          </p>
          <p className="mb-2">
            <FontAwesomeIcon
              icon={faScaleBalanced}
              className="mr-2"
              size="xs"
            />
            Given praise total score:{' '}
            {user.givenTotalScore ? user.givenTotalScore : '-'}
          </p>
        </div>
      </div>

      {user.receivedTotalCount && user.receivedTotalCount >= 10 ? (
        <Bio userAccountId={discordAccount?._id} />
      ) : (
        <div>
          <div className="mt-3 mb-1 font-bold">Contributor bio</div>
          <div>At least 10 received praise are required to generate bio.</div>
        </div>
      )}

      <>{isAdmin && <UserInfoAdminRolesInput user={user} roles={roles} />}</>
    </Box>
  );
};
