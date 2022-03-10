import { useWeb3React } from '@web3-react/core';
import { useEffect, useState } from 'react';
import { injected } from './connectors';

export function useEagerConnect(): boolean {
  const { activate, active } = useWeb3React();
  const [tried, setTried] = useState<boolean>(false);

  /* eslint-disable */
  useEffect(() => {
    injected.isAuthorized().then((isAuthorized: boolean) => {
      if (isAuthorized) {
        activate(injected, undefined, true).catch(() => {
          setTried(true);
        });
      } else {
        setTried(true);
      }
    });
  }, []); // intentionally only running on mount (make sure it's only mounted once :))
  /* eslint-enable */

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (!tried && active) {
      setTried(true);
    }
  }, [tried, active]);

  return tried;
}

export function useInactiveListener(suppress = false): void {
  const { active, error, activate } = useWeb3React();

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { ethereum } = window as any;
    if (ethereum && ethereum.on && !active && !error && !suppress) {
      const handleConnect = async (): Promise<void> => {
        console.log("Handling 'connect' event");
        await activate(injected);
      };
      const handleChainChanged = async (
        chainId: string | number
      ): Promise<void> => {
        console.log("Handling 'chainChanged' event with payload", chainId);
        await activate(injected);
      };
      const handleAccountsChanged = async (
        accounts: string[]
      ): Promise<void> => {
        console.log("Handling 'accountsChanged' event with payload", accounts);
        if (accounts.length > 0) {
          await activate(injected);
        }
      };
      const handleNetworkChanged = async (
        networkId: string | number
      ): Promise<void> => {
        console.log("Handling 'networkChanged' event with payload", networkId);
        await activate(injected);
      };

      ethereum.on('connect', handleConnect);
      ethereum.on('chainChanged', handleChainChanged);
      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('networkChanged', handleNetworkChanged);

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener('connect', handleConnect);
          ethereum.removeListener('chainChanged', handleChainChanged);
          ethereum.removeListener('accountsChanged', handleAccountsChanged);
          ethereum.removeListener('networkChanged', handleNetworkChanged);
        }
      };
    }
  }, [active, error, suppress, activate]);
}
