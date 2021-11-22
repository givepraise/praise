export const getSessionToken = (
  account: string | null | undefined
): string | null => {
  if (!account) return null;
  return localStorage.getItem(`jwt_${account}`);
};

export const setSessionToken = (account: string, sessionId: string) => {
  localStorage.setItem(`jwt_${account}`, sessionId);
};

export const removeSessionToken = (account: string | null | undefined) => {
  if (!account) return;
  localStorage.removeItem(`jwt_${account}`);
};
