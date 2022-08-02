import { ActiveUserQuantificationsMessage } from './ActiveUserQuantificationsMessage';

const ActiveNoticesBoardInner = (): JSX.Element | null => {
  const activeUserQuantificationMessageRender =
    ActiveUserQuantificationsMessage();

  if (!activeUserQuantificationMessageRender) return null;

  return (
    <div className="mb-5 praise-box">
      {activeUserQuantificationMessageRender &&
        activeUserQuantificationMessageRender}
    </div>
  );
};

export const ActiveNoticesBoard = (): JSX.Element | null => {
  return <ActiveNoticesBoardInner />;
};
