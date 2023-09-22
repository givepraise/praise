import React, { ReactNode, useEffect, useState } from 'react';
import Safe, { EthersAdapter } from '@safe-global/protocol-kit';
import { useAccount, useNetwork } from 'wagmi';

import SafeApiKit from '@safe-global/api-kit';
import { ethers } from 'ethers';
import { useSafeConfig } from '../hooks/useSafeConfig';
import { useSigner } from '../../wagmi/hooks/useSigner';
import { SafeContext } from '../types/use-safe-return';
import { useRecoilValue } from 'recoil';
import { CurrentCommunity } from '../../community/community';

export const ReactSafeContext = React.createContext<SafeContext | undefined>(
  undefined
);

const initialState: SafeContext = {
  owners: [] as string[],
  threshold: 0,
  isCurrentUserOwner: false,
};

type SafeProviderProps = {
  children: ReactNode;
};

export const SafeContextProvider: React.FC<SafeProviderProps> = ({
  children,
}: SafeProviderProps) => {
  const { chain } = useNetwork();
  const rpcSigner = useSigner();
  const { address: userAddress } = useAccount();
  const safeConfig = useSafeConfig(chain?.id);
  const community = useRecoilValue(CurrentCommunity);
  const address = community?.creator;

  const [state, setState] = useState<SafeContext>(initialState);

  /**
   * Reset state to initial state on chain change
   */
  function resetState(): void {
    setState(initialState);
  }

  function initializeEthersAdapter(): void {
    if (!rpcSigner) return;
    try {
      const adapter = new EthersAdapter({
        ethers,
        signerOrProvider: rpcSigner,
      });
      setState((prev) => ({
        ...prev,
        ethersAdapter: adapter,
        ethersAdapterError: undefined,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        ethersAdapter: undefined,
        ethersAdapterError: error as Error,
      }));
      console.error(error);
    }
  }

  function initializeSafeApiKit(): void {
    try {
      if (!state.ethersAdapter || !safeConfig) return;
      const apiKit = new SafeApiKit({
        txServiceUrl: safeConfig.serviceUrl,
        ethAdapter: state.ethersAdapter,
      });
      setState((prev) => ({
        ...prev,
        safeApiKit: apiKit,
        safeApiKitError: undefined,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        safeApiKit: undefined,
        safeApiKitError: error as Error,
      }));
      console.error(error);
    }
  }

  function listSafesByOwner(): void {
    void (async (): Promise<void> => {
      try {
        if (!state.safeApiKit || !userAddress) return;
        const ownerResponse = await state.safeApiKit.getSafesByOwner(
          userAddress
        );
        setState((prev) => ({
          ...prev,
          safes: ownerResponse.safes,
          safesError: undefined,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          safes: undefined,
          safesError: error as Error,
        }));
        console.error(error);
      }
    })();
  }

  function initializeSafeInstance(): void {
    void (async (): Promise<void> => {
      try {
        if (!state.ethersAdapter || !address) return;
        const safeInstance = await Safe.create({
          ethAdapter: state.ethersAdapter,
          safeAddress: address,
        });
        setState((prev) => ({
          ...prev,
          safe: safeInstance,
          safeAddress: address,
          safeError: undefined,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          safe: undefined,
          safeError: error as Error,
        }));
        console.error(error);
      }
    })();
  }

  function loadOwnersAndThreshold(): void {
    void (async (): Promise<void> => {
      try {
        if (!state.safe || !userAddress) return;
        const safeOwners = await state.safe.getOwners();
        const safeThreshold = await state.safe.getThreshold();
        const currentUserIsOwner = safeOwners.includes(userAddress);
        setState((prev) => ({
          ...prev,
          owners: safeOwners,
          threshold: safeThreshold,
          isCurrentUserOwner: currentUserIsOwner,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          ownersAndThresholdError: error as Error,
        }));
        console.error(error);
      }
    })();
  }

  useEffect(resetState, [chain]);
  useEffect(initializeEthersAdapter, [rpcSigner]);
  useEffect(initializeSafeApiKit, [state.ethersAdapter, safeConfig]);
  useEffect(listSafesByOwner, [state.safeApiKit, userAddress]);
  useEffect(initializeSafeInstance, [state.ethersAdapter, address]);
  useEffect(loadOwnersAndThreshold, [state.safe, userAddress]);

  const safeData = { ...state, address };

  return (
    <ReactSafeContext.Provider value={safeData}>
      {children}
    </ReactSafeContext.Provider>
  );
};
