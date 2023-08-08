export type ExecuteSafeTransactionStateType = {
  state: 'executing' | 'executed' | 'error';
  error?: Error;
};
