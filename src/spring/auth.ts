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

export function saveSession(account: string, sessionId: string) {
  localStorage.setItem(`praise_key_${account}`, sessionId);
}

export function loadSession(account: string): string | null {
  return localStorage.getItem(`praise_key_${account}`);
}
