import { EventLogDto, EventLogTypeKey } from 'api/dist/eventlog/types';
import { useRecoilValue } from 'recoil';
import { Tooltip } from '@mui/material';
import {
  formatIsoDateUTC,
  DATE_FORMAT_LONG,
  localizeAndFormatIsoDate,
} from '@/utils/date';
import { UserAvatar } from '@/components/user/UserAvatar';
import { SingleUser } from '@/model/users';
import { classNames } from '@/utils/index';
import { InlineLabel } from '../InlineLabel';
import { Notice } from '../Notice';
import { UserName } from '../user/UserName';
import { UserPopover } from '../user/UserPopover';

const eventLogTypeColors = {
  [EventLogTypeKey.PERMISSION]: 'bg-orange-400',
  [EventLogTypeKey.AUTHENTICATION]: 'bg-red-400',
  [EventLogTypeKey.PERIOD]: 'bg-blue-400',
  [EventLogTypeKey.PRAISE]: 'bg-yellow-400',
  [EventLogTypeKey.QUANTIFICATION]: 'bg-green-400',
  [EventLogTypeKey.SETTING]: 'bg-indigo-400',
};

interface Params {
  eventlog: EventLogDto;
  className?: string;
}

export const EventLog = ({
  eventlog,
  className = '',
}: Params): JSX.Element | null => {
  const user = useRecoilValue(SingleUser(eventlog.user));

  return (
    <div className={classNames('flex items-center w-full', className)}>
      <div className="flex items-center text-2xl">
        <UserPopover
          user={user}
          userAccount={eventlog.useraccount}
          className="inline-block"
        >
          <UserAvatar userAccount={eventlog.useraccount} user={user} />
        </UserPopover>
      </div>
      <div className="flex-grow p-3 overflow-hidden">
        <div>
          <UserPopover
            user={user}
            userAccount={eventlog.useraccount}
            className="inline-block"
          >
            <UserName
              user={user}
              userAccount={eventlog.useraccount}
              className="font-bold"
            />
          </UserPopover>
          <Tooltip
            placement="right-end"
            title={`${formatIsoDateUTC(
              eventlog.createdAt,
              DATE_FORMAT_LONG
            )} UTC`}
            arrow
          >
            <span className="ml-2 text-xs text-warm-gray-300">
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
