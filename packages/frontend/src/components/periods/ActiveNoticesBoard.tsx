import { ActivePeriodMessage } from './ActivePeriodMessage';
import { ActiveUserQuantificationsMessage } from './ActiveUserQuantificationsMessage';
import { Suspense } from 'react';

export const ActiveNoticesBoard = (): JSX.Element | null => {
  const activePeriodMessageRender = ActivePeriodMessage({});

  const activeUserQuantificationMessageRender =
    ActiveUserQuantificationsMessage();

  if (!activePeriodMessageRender && !activeUserQuantificationMessageRender)
    return null;

  return (
    <div className="w-2/3 praise-box">
      <Suspense fallback="Loading…">
        {activePeriodMessageRender && activePeriodMessageRender}
        {activeUserQuantificationMessageRender &&
          activeUserQuantificationMessageRender}
      </Suspense>
    </div>
  );
};
