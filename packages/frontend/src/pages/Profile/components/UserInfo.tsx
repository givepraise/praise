import { UserDto } from 'api/dist/user/types';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { Box } from '@/components/ui/Box';
import { DATE_FORMAT_TZ, formatIsoDateUTC } from '@/utils/date';

interface Params {
  user: UserDto;
}

export const UserInfo = ({ user }: Params): JSX.Element | null => {
  const [imageLoadError, setImageLoadError] = React.useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = React.useState<boolean>(false);

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
          <h2 className="mb-1">{account.nameRealized}</h2>
          <p className="mb-2">{account.name}</p>
          <p className="mb-2">{user.identityEthAddress}</p>
        </div>

        <div className="">
          <p className="mb-3">
            <FontAwesomeIcon
              icon={faCalendarAlt}
              className="mr-2"
              size="1x"
            ></FontAwesomeIcon>
            {formatIsoDateUTC(account.createdAt, DATE_FORMAT_TZ)}
          </p>
          <p className="mb-2">Number of praise received:</p>
          <p className="mb-2">Total praise score:</p>
        </div>
      </div>
    </Box>
  );
};
