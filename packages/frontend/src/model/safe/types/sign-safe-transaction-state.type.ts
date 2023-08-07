export type SignSafeTransactionStateType = {
  state: 'signing' | 'signed' | 'error';
  error?: Error;
};
