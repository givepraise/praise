import {
  formatIsoDateUTC,
  DATE_FORMAT_LONG,
  localizeAndFormatIsoDate,
} from '@/utils/date';
import { UserAvatar } from '@/components/user/UserAvatar';
import { EventLogDto, EventLogTypeKey } from 'api/dist/eventlog/types';
import { SingleUser } from '@/model/users';
import { useRecoilValue } from 'recoil';
import { InlineLabel } from '../InlineLabel';
import { UserDto } from 'api/dist/user/types';
import { UserAccountDto } from 'api/dist/useraccount/types';
import Notice from '../Notice';
import { Tooltip } from '@mui/material';
import { classNames } from '@/utils/index';

const eventLogTypeColors = {
  [EventLogTypeKey.PERMISSION]: 'bg-orange-400',
  [EventLogTypeKey.AUTHENTICATION]: 'bg-red-400',
  [EventLogTypeKey.PERIOD]: 'bg-blue-400',
  [EventLogTypeKey.PRAISE]: 'bg-yellow-400',
  [EventLogTypeKey.QUANTIFICATION]: 'bg-green-400',
  [EventLogTypeKey.SETTING]: 'bg-indigo-400',
};

const getEventLogUsername = (
  user: UserDto | undefined,
  useraccount: UserAccountDto | undefined
): string | undefined => {
  if (user) {
    return user.nameRealized;
  } else if (useraccount) {
    return useraccount.name;
  } else {
    return undefined;
  }
};

interface Params {
  eventlog: EventLogDto;
  className?: string;
}

const EventLog = ({ eventlog, className = '' }: Params): JSX.Element | null => {
  const user = useRecoilValue(SingleUser(eventlog.user));

  return (
    <div className={classNames('flex items-center w-full', className)}>
      <div className="flex items-center">
        <UserAvatar userAccount={eventlog.useraccount} user={user} />
      </div>
      <div className="flex-grow p-3 overflow-hidden">
        <div>
          <span className="font-bold">
            {getEventLogUsername(user, eventlog.useraccount)}
          </span>
          <Tooltip
            placement="right-end"
            title={`${formatIsoDateUTC(
              eventlog.createdAt,
              DATE_FORMAT_LONG
            )} UTC`}
            arrow
          >
            <span className="ml-2 text-xs text-gray-500">
              {localizeAndFormatIsoDate(eventlog.createdAt)}
            </span>
          </Tooltip>
        </div>

        <div className="w-full">
          <InlineLabel
            text={eventlog.type.label}
            title={eventlog.type.description}
            className={eventLogTypeColors[eventlog.type.key]}
          />

          {eventlog.hidden ? (
            <div className="w-full mt-1">
              <Notice type="danger">
                <>Praise scores are not visible during quantification.</>
              </Notice>
            </div>
          ) : (
            eventlog.description
          )}
        </div>
      </div>
    </div>
  );
};

export default EventLog;
