import { useSigner } from '../../eth/hooks/useSigner';
import Safe, { EthersAdapter } from '@safe-global/protocol-kit';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import SafeApiKit from '@safe-global/api-kit';
import { ETH_CHAIN_ID } from '../../eth/eth.constants';
import { SAFE_TX_SERVICE_URL } from '../safe.constants';

type useSafeReturn = {
  ethersAdapter: EthersAdapter | undefined;
  safe: Safe | undefined;
  safeApiKit: SafeApiKit | undefined;
};

export function useSafe(safeAddress: string | undefined): useSafeReturn {
  const signer = useSigner(ETH_CHAIN_ID);
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
