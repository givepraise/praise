import {
  UpdateUserProfileInput,
  UserDetailsDto,
  UserDto,
  UserRole,
} from 'api/dist/user/types';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt,
  faScaleBalanced,
  faUserLock,
} from '@fortawesome/free-solid-svg-icons';
import { shortenEthAddress } from 'api/dist/user/utils/core';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import { Dialog } from '@headlessui/react';
import { toast } from 'react-hot-toast';
import { Jazzicon } from '@ukstv/jazzicon-react';
import { useRecoilValue } from 'recoil';
import { Box } from '@/components/ui/Box';
import { formatIsoDateUTC, DATE_FORMAT } from '@/utils/date';
import { classNames } from '@/utils/index';
import { Button } from '@/components/ui/Button';
import { useAdminUsers, useUserProfile } from '@/model/users';
import { isResponseOk } from '@/model/api';
import { ActiveUserId, HasRole, ROLE_ADMIN } from '@/model/auth';
import { UserAvatar } from '@/components/user/UserAvatar';
import { EditProfileDialog } from './EditProfileDialog';

interface Params {
  user: UserDetailsDto;
}

export const UserInfo = ({ user }: Params): JSX.Element | null => {
  const dialogRef = React.useRef(null);

  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);

  const { addRole, removeRole } = useAdminUsers();

  const isAdmin = useRecoilValue(HasRole(ROLE_ADMIN));
  const activeUserId = useRecoilValue(ActiveUserId);

  const isProfilePage = user._id === activeUserId;

  const roles = [UserRole.ADMIN, UserRole.FORWARDER, UserRole.QUANTIFIER];

  const discordAccount = user.accounts?.find((a) => a.platform === 'DISCORD');

  const { update } = useUserProfile();

  const handleSaveUserProfile = async (
    values: UpdateUserProfileInput
  ): Promise<void> => {
    const { username, rewardsEthAddress } = values;
    const response = await update(username, rewardsEthAddress);

    if (isResponseOk(response)) {
      toast.success('User profile saved');
    } else {
      toast.error('Profile update failed');
    }

    setIsDialogOpen(false);
  };

  const handleRole = async (role: UserRole, user: UserDto): Promise<void> => {
    let resp;
    const isRemove = user.roles.includes(role);
    if (isRemove) {
      resp = await removeRole(user._id, role);
    } else {
      resp = await addRole(user._id, role);
    }
    if (resp?.status === 200) {
      toast.success(`Role ${isRemove ? 'removed' : 'added'} successfully!`);
    }
  };

  return (
    <Box>
      <div className="flex justify-between mb-8">
        <div className="m-3 text-8xl">
          <UserAvatar user={user} />
        </div>
        {isProfilePage && (
          <div>
            <Button onClick={(): void => setIsDialogOpen(true)} className="">
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
              Payout address: {shortenEthAddress(user.rewardsEthAddress)}
            </span>
          </div>
          {!isAdmin && (
            <div className="mb-2">
              <FontAwesomeIcon icon={faUserLock} className="mr-2" size="1x" />
              User roles:{' '}
              {user.roles.map(
                (r, index, array) =>
                  `${r}${array.length > index + 1 ? ', ' : ''}`
              )}
            </div>
          )}
        </div>

        <div className="sm:absolute sm:bottom-0 sm:right-0">
          <p className="mb-2">
            <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" size="1x" />
            Joined: {formatIsoDateUTC(user.createdAt, DATE_FORMAT)}
          </p>
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

      <>
        {isAdmin && (
          <div className="flex flex-wrap gap-4 pt-5">
            {roles.map((role) => (
              <div
                key={role}
                className={classNames(
                  'flex gap-2 justify-center items-center py-2 px-3 rounded-md bg-themecolor-alt-2',
                  user.roles.includes(role) ? '' : 'opacity-50'
                )}
                onClick={(): void => void handleRole(role, user)}
              >
                <input
                  checked={user.roles.includes(role)}
                  className="cursor-pointer"
                  name={role}
                  type="checkbox"
                  readOnly
                />
                <label className="text-white " htmlFor={role}>
                  {role}
                </label>
              </div>
            ))}
          </div>
        )}
      </>

      <Dialog
        open={isDialogOpen}
        onClose={(): void => setIsDialogOpen(false)}
        className="fixed inset-0 z-10 overflow-y-auto"
        initialFocus={dialogRef}
      >
        <div ref={dialogRef}>
          <EditProfileDialog
            onClose={(): void => setIsDialogOpen(false)}
            onSave={(values): void => void handleSaveUserProfile(values)}
            user={user}
          />
        </div>
      </Dialog>
    </Box>
  );
};
