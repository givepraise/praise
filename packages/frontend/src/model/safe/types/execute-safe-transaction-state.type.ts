export type ExecuteSafeTransactionStateType = {
  state: 'executing' | 'indexing' | 'executed' | 'error';
  error?: Error;
};
