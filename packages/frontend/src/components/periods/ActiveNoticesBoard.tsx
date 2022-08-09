import { ActiveUserQuantificationsMessage } from './ActiveUserQuantificationsMessage';
import { Box } from '../ui/Box';

const ActiveNoticesBoardInner = (): JSX.Element | null => {
  const activeUserQuantificationMessageRender =
    ActiveUserQuantificationsMessage();

  if (!activeUserQuantificationMessageRender) return null;

  return (
    <Box className="mb-5">
      {activeUserQuantificationMessageRender &&
        activeUserQuantificationMessageRender}
    </Box>
  );
};

export const ActiveNoticesBoard = (): JSX.Element | null => {
  return <ActiveNoticesBoardInner />;
};
