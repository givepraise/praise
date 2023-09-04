import { type PublicClient, type WalletClient } from '@wagmi/core';
import { providers } from 'ethers';
import { type HttpTransport } from 'viem';
import { useEffect, useState } from 'react';
import type { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { usePublicClient, useWalletClient } from 'wagmi';

export function publicClientToProvider(publicClient: PublicClient) {
  const { chain, transport } = publicClient;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  if (transport.type === 'fallback')
    return new providers.FallbackProvider(
      (transport.transports as ReturnType<HttpTransport>[]).map(
        ({ value }) => new providers.JsonRpcProvider(value?.url, network)
      )
    );
  return new providers.JsonRpcProvider(transport.url, network);
}

export function walletClientToSigner(walletClient: WalletClient) {
  const { account, chain, transport } = walletClient;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const provider = new providers.Web3Provider(transport as any, network);
  const signer = provider.getSigner(account.address);

  return signer;
}

export function useSigner() {
  const { data: walletClient } = useWalletClient();

  const [signer, setSigner] = useState<JsonRpcSigner | undefined>(undefined);
  useEffect(() => {
    if (!walletClient) return;

    const tmpSigner = walletClientToSigner(walletClient);

    setSigner(tmpSigner);
  }, [walletClient]);
  return signer;
}

export function useProvider() {
  const publicClient = usePublicClient();

  const [provider, setProvider] = useState<JsonRpcProvider | undefined>(
    undefined
  );
  useEffect(() => {
    if (!publicClient) return;

    const tmpProvider = publicClientToProvider(publicClient);

    setProvider(tmpProvider as JsonRpcProvider);
  }, [publicClient]);
  return provider;
}
