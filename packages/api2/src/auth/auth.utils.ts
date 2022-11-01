/**
 * Generate a login message that will be signed by the frontend user, and validated by the api

 * @param  {string} account
 * @param  {string} nonce
 * @returns string
 */
export const generateLoginMessage = (
  account: string,
  nonce: string,
): string => {
  return (
    'SIGN THIS MESSAGE TO LOGIN TO PRAISE.\n\n' +
    `ADDRESS:\n${account}\n\n` +
    `NONCE:\n${nonce}`
  );
};
