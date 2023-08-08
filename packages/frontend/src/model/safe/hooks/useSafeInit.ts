// External package imports
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import Safe, { EthersAdapter } from '@safe-global/protocol-kit';
import SafeApiKit from '@safe-global/api-kit';

// Internal imports
import { useSigner } from '../../eth/hooks/useSigner';
import { ETH_CHAIN_ID } from '../../eth/eth.constants';
import { SAFE_TX_SERVICE_URL } from '../safe.constants';
import { useCommunity } from '../../communitites/hooks/useCommunity';
import { UseSafeReturn } from '../types/use-safe-return';
import { useAccount } from 'wagmi';

/**
 * Custom hook to interface with the Safe protocol and associated utilities.
 * @returns An object containing Safe protocol utilities and information.
 */
export function useSafeInit(): UseSafeReturn {
  // Hooks
  const { community } = useCommunity();
  const rpcSigner = useSigner(ETH_CHAIN_ID);
  const { address: userAddress } = useAccount();

  // Local state
  const [ethersAdapter, setEthersAdapter] = useState<EthersAdapter>();
  const [safe, setSafe] = useState<Safe>();
  const [safeApiKit, setSafeApiKit] = useState<SafeApiKit>();
  const [isValidSafeAddress, setIsValidSafeAddress] = useState<boolean>();
  const [owners, setOwners] = useState<string[]>([]);
  const [threshold, setThreshold] = useState<number>(0);
  const [isCurrentUserOwner, setIsCurrentUserOwner] = useState<boolean>(false);
  const SAFE_ADDRESS = community?.creator;

  /**
   * Initialize the Ethers adapter.
   */
  function initializeEthersAdapter(): void {
    if (!rpcSigner) return;
    setEthersAdapter(
      new EthersAdapter({
        ethers,
        signerOrProvider: rpcSigner,
      })
    );
  }

  /**
   * Create and initialize the Safe instance.
   */
  function initializeSafeInstance(): void {
    if (!ethersAdapter || !SAFE_ADDRESS) return;
    void (async (): Promise<void> => {
      const safeInstance = await Safe.create({
        ethAdapter: ethersAdapter,
        safeAddress: SAFE_ADDRESS,
      });
      setSafe(safeInstance);
    })();
  }

  /**
   * Initialize the Safe API Kit.
   */
  function initializeSafeApiKit(): void {
    if (!ethersAdapter || !SAFE_ADDRESS) return;
    void (async (): Promise<void> => {
      const apiKit = new SafeApiKit({
        txServiceUrl: SAFE_TX_SERVICE_URL,
        ethAdapter: ethersAdapter,
      });
      setSafeApiKit(apiKit);
      try {
        await apiKit.getSafeInfo(SAFE_ADDRESS); // Throws if the Safe address is invalid
        setIsValidSafeAddress(true);
      } catch (e) {
        setIsValidSafeAddress(false);
      }
    })();
  }

  /**
   * Load the owners and threshold values.
   */
  function loadOwnersAndThreshold(): void {
    if (!safe || !userAddress) return;
    void (async (): Promise<void> => {
      const safeOwners = await safe.getOwners();
      const safeThreshold = await safe.getThreshold();
      if (safeOwners.includes(userAddress)) {
        setIsCurrentUserOwner(true);
      }
      setOwners(safeOwners);
      setThreshold(safeThreshold);
    })();
  }

  useEffect(initializeEthersAdapter, [rpcSigner]);
  useEffect(initializeSafeInstance, [ethersAdapter, SAFE_ADDRESS]);
  useEffect(initializeSafeApiKit, [ethersAdapter, SAFE_ADDRESS]);
  useEffect(loadOwnersAndThreshold, [safe, userAddress]);

  return {
    isValidSafeAddress,
    owners,
    threshold,
    isCurrentUserOwner,
    ethersAdapter,
    safe,
    safeApiKit,
    SAFE_ADDRESS,
  };
}
