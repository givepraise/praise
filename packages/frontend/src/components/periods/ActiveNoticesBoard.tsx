import { PraiseBox } from '../ui/PraiseBox';
// eslint-disable-next-line import/order
import { ActiveUserQuantificationsMessage } from './ActiveUserQuantificationsMessage';

const ActiveNoticesBoardInner = (): JSX.Element | null => {
  const activeUserQuantificationMessageRender =
    ActiveUserQuantificationsMessage();

  if (!activeUserQuantificationMessageRender) return null;

  return (
    <PraiseBox classes="mb-5">
      {activeUserQuantificationMessageRender &&
        activeUserQuantificationMessageRender}
    </PraiseBox>
  );
};

export const ActiveNoticesBoard = (): JSX.Element | null => {
  return <ActiveNoticesBoardInner />;
};
