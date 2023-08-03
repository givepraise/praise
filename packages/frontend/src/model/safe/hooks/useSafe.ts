import { useSigner } from '../../ethers/hooks/useSigner';
import Safe, { EthersAdapter } from '@safe-global/protocol-kit';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import SafeApiKit from '@safe-global/api-kit';

// These constants might later be replaced with community settings, allowing
// each community to select which chain etc. to use.
const CHAIN_ID = 10; // Optimism
const SAFE_TX_SERVICE_URL = 'https://safe-transaction-optimism.safe.global';

type useSafeReturn = {
  ethersAdapter: EthersAdapter | undefined;
  safe: Safe | undefined;
  safeApiKit: SafeApiKit | undefined;
};

export function useSafe(safeAddress: string | undefined): useSafeReturn {
  const signer = useSigner(CHAIN_ID);
  const [ethersAdapter, setEthersAdapter] = useState<EthersAdapter | undefined>(
    undefined
  );
  const [safe, setSafe] = useState<Safe | undefined>(undefined);
  const [safeApiKit, setSafeApiKit] = useState<SafeApiKit | undefined>(
    undefined
  );

  useEffect(() => {
    if (!signer) return;
    setEthersAdapter(
      new EthersAdapter({
        ethers,
        signerOrProvider: signer,
      })
    );
  }, [signer]);

  useEffect(() => {
    if (!ethersAdapter || !safeAddress) return;
    const createSafe = async (): Promise<void> => {
      const safe = await Safe.create({
        ethAdapter: ethersAdapter,
        safeAddress,
      });
      setSafe(safe);
    };
    void createSafe();
  }, [ethersAdapter, safeAddress]);

  useEffect(() => {
    if (!ethersAdapter) return;
    setSafeApiKit(
      new SafeApiKit({
        txServiceUrl: SAFE_TX_SERVICE_URL,
        ethAdapter: ethersAdapter,
      })
    );
  }, [ethersAdapter]);

  return { ethersAdapter, safe, safeApiKit };
}
