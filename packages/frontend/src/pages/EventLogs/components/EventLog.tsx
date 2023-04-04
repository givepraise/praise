import { Tooltip } from '@mui/material';
import {
  formatIsoDateUTC,
  DATE_FORMAT_LONG,
  localizeAndFormatIsoDate,
} from '@/utils/date';
import { UserAvatar } from '@/components/user/UserAvatar';
import { classNames } from '@/utils/index';
import { InlineLabel } from '../../../components/ui/InlineLabel';
import { UserName } from '../../../components/user/UserName';
import { UserPopover } from '../../../components/user/UserPopover';
import { EventLog as EventLogDto } from '@/model/eventlog/dto/event-log.dto';

interface Params {
  eventlog: EventLogDto;
  className?: string;
}

export const EventLog = ({
  eventlog,
  className = '',
}: Params): JSX.Element | null => {
  return (
    <div className={classNames('flex items-center w-full', className)}>
      {(eventlog.user || eventlog.useraccount) && (
        <div className="flex items-center text-2xl">
          <UserPopover
            user={eventlog.user}
            userAccount={eventlog.useraccount}
            className="w-8"
          >
            <UserAvatar
              userAccount={eventlog.useraccount}
              user={eventlog.user}
            />
          </UserPopover>
        </div>
      )}

      <div className="flex-grow p-3 overflow-hidden">
        {(eventlog.user || eventlog.useraccount) && (
          <div>
            <UserPopover
              user={eventlog.user}
              userAccount={eventlog.useraccount}
              className="inline-block"
            >
              <UserName
                user={eventlog.user}
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
        )}

        <div className="w-full">
          <InlineLabel
            text={eventlog.type.label}
            title={eventlog.type.description}
          />
          {eventlog.description}
        </div>
      </div>
    </div>
  );
};
