import React, { useEffect } from 'react';

const PlausibleAnalytics = () => {
  useEffect(() => {
    const script = document.createElement('script');

    script.src = 'https://plausible.io/js/script.js';
    script.defer = true;
    // TODO should change it for different environments
    script['data-domain'] = 'givepraise.xyz';

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    }
  }, []);

  return null;
};

export default PlausibleAnalytics;
