import Safe, { EthersAdapter } from '@safe-global/protocol-kit';

import SafeApiKit from '@safe-global/api-kit';

export type SafeAddressList = string[];

export type SafeContext = {
  ethersAdapter?: EthersAdapter;
  ethersAdapterError?: Error;
  safeApiKit?: SafeApiKit;
  safeApiKitError?: Error;
  safeAddress?: string;
  safe?: Safe;
  safeError?: Error;
  safes?: SafeAddressList;
  safesError?: Error;
  owners: string[] | undefined[];
  threshold: number;
  isCurrentUserOwner: boolean;
  ownersAndThresholdError?: Error;
};
