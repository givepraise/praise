export const getSessionToken = (
  account: string | null | undefined
): string | null => {
  if (!account) return null;
  return localStorage.getItem(`jwt_${account}`);
};

export const setSessionToken = (account: string, sessionId: string): void => {
  localStorage.setItem(`jwt_${account}`, sessionId);
};

export const removeSessionToken = (
  account: string | null | undefined
): void => {
  if (!account) return;
  localStorage.removeItem(`jwt_${account}`);
};

export const getRefreshToken = (
  account: string | null | undefined
): string | null => {
  if (!account) return null;
  return localStorage.getItem(`jwt_${account}`);
};

export const setRefreshToken = (account: string, sessionId: string): void => {
  localStorage.setItem(`jwt_${account}`, sessionId);
};

export const removeRefreshToken = (
  account: string | null | undefined
): void => {
  if (!account) return;
  localStorage.removeItem(`jwt_${account}`);
};
