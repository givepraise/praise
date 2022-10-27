import {
  UpdateUserProfileInput,
  UserDetailsDto,
  UserRole,
} from 'api/dist/user/types';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt,
  faChartPie,
  faScaleBalanced,
  faUserLock,
} from '@fortawesome/free-solid-svg-icons';
import { shortenEthAddress } from 'api/dist/user/utils/core';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import { Dialog } from '@headlessui/react';
import { toast } from 'react-hot-toast';
import { Box } from '@/components/ui/Box';
import { formatIsoDateUTC, DATE_FORMAT_NAME } from '@/utils/date';
import { classNames } from '@/utils/index';
import { Button } from '@/components/ui/Button';
import { useUserProfile } from '@/model/users';
import { isResponseOk } from '@/model/api';
import { EditProfileDialog } from './EditProfileDialog';

interface Params {
  user: UserDetailsDto;
  isProfilePage: boolean;
}

export const UserInfo = ({
  user,
  isProfilePage,
}: Params): JSX.Element | null => {
  const dialogRef = React.useRef(null);

  const [imageLoadError, setImageLoadError] = React.useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = React.useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);

  const roles = [UserRole.ADMIN, UserRole.FORWARDER, UserRole.QUANTIFIER];

  const avatars = user.accounts?.map((a) => a.avatarId).filter((e) => e) || [];
  const account = user.accounts?.[0];

  const { update } = useUserProfile();

  if (!account) return null;

  const handleSaveUserProfile = async (
    values: UpdateUserProfileInput
  ): Promise<void> => {
    const { username, rewardsEthAddress } = values;
    const response = await update(username, rewardsEthAddress);

    if (isResponseOk(response)) {
      toast.success('User profile saved');
      setIsDialogOpen(false);
    } else {
      toast.error('Profile update failed');
    }
  };

  return (
    <Box>
      <div className="flex justify-between mb-8">
        <div>
          <img
            src={avatars[0] as string}
            onError={(): void => setImageLoadError(true)}
            onLoad={(): void => setImageLoaded(true)}
            alt="avatar"
            className="inline-block object-cover object-center w-32 h-32 border rounded-full"
            style={!imageLoaded ? { display: 'none' } : {}}
          />
        </div>
        {isProfilePage && (
          <div>
            <Button onClick={(): void => setIsDialogOpen(true)} className="">
              Edit profile
            </Button>
          </div>
        )}
      </div>

      <div className="relative flex justify-between">
        <div className="">
          <h2 className="mb-1">{user.username}</h2>
          <p className="mb-2">
            <FontAwesomeIcon icon={faDiscord} className="mr-2" size="1x" />
            {account.name}
          </p>
          <p className="mb-2">
            <FontAwesomeIcon icon={faChartPie} className="mr-4" size="1x" />
            Identity address: {shortenEthAddress(user.identityEthAddress)}
          </p>
          <p className="mb-2">
            <FontAwesomeIcon icon={faChartPie} className="mr-4" size="1x" />
            Payout address: {shortenEthAddress(user.rewardsEthAddress)}
          </p>
          {!isProfilePage && (
            <p className="mb-2">
              <FontAwesomeIcon icon={faUserLock} className="mr-4" size="1x" />
              User roles: {user.roles.map((r) => `${r}, `)}
            </p>
          )}
        </div>

        <div className="absolute bottom-0 right-0">
          <p className="mb-3">
            <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" size="1x" />
            Joined {formatIsoDateUTC(account.createdAt, DATE_FORMAT_NAME)}
          </p>
          <p className="mb-2">
            <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" size="1x" />
            Latest activity{' '}
            {formatIsoDateUTC(account.updatedAt, DATE_FORMAT_NAME)}
          </p>
          <p className="mb-2">
            <FontAwesomeIcon
              icon={faScaleBalanced}
              className="mr-2"
              size="1x"
            />
            Received praise total score:{' '}
            {user.praiseStatistics?.receivedTotalScore}
          </p>
          <p className="mb-2">
            <FontAwesomeIcon
              icon={faScaleBalanced}
              className="mr-2"
              size="1x"
            />
            Given praise total score: {user.praiseStatistics?.givenTotalScore}
          </p>
        </div>
      </div>

      <>
        {isProfilePage && (
          <div className="flex flex-wrap gap-4 pt-5">
            {roles.map((role) => (
              <div
                key={role}
                className={classNames(
                  'flex gap-2 justify-center items-center py-2 px-3 rounded-md bg-themecolor-alt-2',
                  user.roles.includes(role) ? '' : 'opacity-50'
                )}
              >
                <input
                  checked={user.roles.includes(role)}
                  className=""
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
