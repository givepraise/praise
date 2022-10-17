import { UserDto, UserRole } from 'api/dist/user/types';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt,
  faHandHoldingHeart,
  faScaleBalanced,
  faPrayingHands,
} from '@fortawesome/free-solid-svg-icons';
import { shortenEthAddress } from 'api/dist/user/utils/core';
import { faDiscord, faEthereum } from '@fortawesome/free-brands-svg-icons';
import { Box } from '@/components/ui/Box';
import { DATE_FORMAT, DATE_FORMAT_TZ, formatIsoDateUTC } from '@/utils/date';
import { classNames } from '@/utils/index';

interface Params {
  user: UserDto;
}

export const UserInfo = ({ user }: Params): JSX.Element | null => {
  const [imageLoadError, setImageLoadError] = React.useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = React.useState<boolean>(false);
  const roles = [UserRole.ADMIN, UserRole.FORWARDER, UserRole.QUANTIFIER];

  const avatars = user.accounts?.map((a) => a.avatarId).filter((e) => e) || [];
  const account = user.accounts?.[0];

  if (!account) return null;

  return (
    <Box>
      <div className="p-2">
        <img
          src={avatars[0] as string}
          onError={(): void => setImageLoadError(true)}
          onLoad={(): void => setImageLoaded(true)}
          alt="avatar"
          className="inline-block object-cover object-center w-32 h-32 border rounded-full"
          style={!imageLoaded ? { display: 'none' } : {}}
        />
      </div>

      <div className="flex justify-between">
        <div className="">
          <h2 className="mb-1">{user.nameRealized}</h2>
          <p className="mb-2">
            <FontAwesomeIcon icon={faDiscord} className="mr-2" size="1x" />
            {account.name}
          </p>
          <p className="mb-2">
            <FontAwesomeIcon icon={faEthereum} className="mr-4" size="1x" />
            Identity address: {shortenEthAddress(user.identityEthAddress)}
          </p>
          <p className="mb-2">
            <FontAwesomeIcon icon={faEthereum} className="mr-4" size="1x" />
            Payout address: {shortenEthAddress(user.rewardsEthAddress)}
          </p>
        </div>

        <div className="">
          <p className="mb-3">
            <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" size="1x" />
            Joined {formatIsoDateUTC(account.createdAt, DATE_FORMAT)}
          </p>
          <p className="mb-2">
            <FontAwesomeIcon
              icon={faHandHoldingHeart}
              className="mr-2"
              size="1x"
            />
            Number of praise given:
          </p>
          <p className="mb-2">
            <FontAwesomeIcon icon={faPrayingHands} className="mr-2" size="1x" />
            Number of praise received:
          </p>
          <p className="mb-2">
            <FontAwesomeIcon
              icon={faScaleBalanced}
              className="mr-2"
              size="1x"
            />
            Total praise score:
          </p>
        </div>
      </div>

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
    </Box>
  );
};
