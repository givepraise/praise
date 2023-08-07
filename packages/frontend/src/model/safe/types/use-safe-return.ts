import SafeApiKit from '@safe-global/api-kit';
import Safe, { EthersAdapter } from '@safe-global/protocol-kit';

export type UseSafeReturn = {
  ethersAdapter?: EthersAdapter;
  safe?: Safe;
  safeApiKit?: SafeApiKit;
  isValidSafeAddress?: boolean;
  owners: string[] | undefined[];
  threshold: number;
  SAFE_ADDRESS?: string;
};
