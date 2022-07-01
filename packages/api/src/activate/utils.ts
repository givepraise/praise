/**
 * Generate an activation message that will be signed by the frontend user, and validated by the api
 *
 * @param  {string} accountId
 * @param  {string} ethereumAddress
 * @param  {string} token
 * @returns string
 */
export const generateActivateMessage = (
  accountId: string,
  ethereumAddress: string,
  token: string
): string => {
  return (
    'SIGN THIS MESSAGE TO ACTIVATE YOUR ACCOUNT.\n\n' +
    `ACCOUNT ID:\n${accountId}\n\n` +
    `ADDRESS:\n${ethereumAddress}\n\n` +
    `TOKEN:\n${token}`
  );
};
