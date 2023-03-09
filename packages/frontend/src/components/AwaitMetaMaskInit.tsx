import React from 'react';

const LOAD_DELAY = 500;

/**
 * Load delay waiting for metamask/eth. Wait half a second before rendering the app.
 */
export function AwaitMetamaskInit({
  children,
}: {
  children: JSX.Element;
}): JSX.Element | null {
  const [delay, setDelay] = React.useState<boolean>(true);

  React.useEffect(() => {
    setTimeout(() => {
      setDelay(false);
    }, LOAD_DELAY);
  }, []);

  if (delay) return null;
  return children;
}
