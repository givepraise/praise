export function saveSessionToken(account: string, sessionId: string) {
  localStorage.setItem(`jwt_${account}`, sessionId);
}

export function loadSessionToken(
  account: string | null | undefined
): string | null {
  if (!account) return null;
  return localStorage.getItem(`jwt_${account}`);
}
