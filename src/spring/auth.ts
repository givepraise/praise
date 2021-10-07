export function generateLoginMessage(
  account: string | undefined,
  nonce: string
): string {
  return (
    "SIGN THIS MESSAGE TO LOGIN TO PRAISE.\n\n" +
    `ADDRESS:\n${account}\n\n` +
    `NONCE:\n${nonce}`
  );
}

export function saveSessionToken(account: string, sessionId: string) {
  localStorage.setItem(`jwt_${account}`, sessionId);
}

export function loadSessionToken(
  account: string | null | undefined
): string | null {
  if (!account) return null;
  return localStorage.getItem(`jwt_${account}`);
}
