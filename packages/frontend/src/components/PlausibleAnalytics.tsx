import { useEffect, ReactElement } from 'react';

const PlausibleAnalytics = (): ReactElement | null => {
  useEffect((): (() => void) => {
    const script = document.createElement('script');

    script.src = 'https://plausible.io/js/script.js';
    script.defer = true;
    // TODO should change it for different environments
    script['data-domain'] = 'givepraise.xyz';

    document.body.appendChild(script);

    return (): void => {
      document.body.removeChild(script);
    };
  }, []);

  return null;
};

export default PlausibleAnalytics;
