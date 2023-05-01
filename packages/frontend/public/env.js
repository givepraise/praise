// This file is used to inject environment variables into the frontend.
// Placeholders are replaced by init-env.js during docker compose startup.

window.REACT_APP_ALCHEMY_KEY = '${REACT_APP_ALCHEMY_KEY}';

window.REACT_APP_WALLETCONNECT_PROJECT_ID =
  '${REACT_APP_WALLETCONNECT_PROJECT_ID}';
