import { injected } from '@/eth/connectors';
import { EthState } from '@/model/eth';
import { ReactComponent as MetamaskIcon } from '@/svg/metamask.svg';
import { faPrayingHands } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import React from 'react';
import { useRecoilValue } from 'recoil';
import EthAccount from './components/EthAccount';
import { LoginButton } from './components/Login';

const hasMetaMask = () => {
  return typeof (window as any).ethereum !== 'undefined';
};

export default function LoginPage() {
  const {
    error: ethError,
    connector: ethConnector,
    activate: ethActivate,
  } = useWeb3React();

  const ethState = useRecoilValue(EthState) as any;

  // Marks which ethConnector is being activated
  const [activatingConnector, setActivatingConnector] = React.useState<
    InjectedConnector | undefined
  >(undefined);

  const activating = injected === activatingConnector;

  // handle logic to recognize the ethConnector currently being activated
  React.useEffect(() => {
    if (activatingConnector && activatingConnector === ethConnector) {
      setActivatingConnector(undefined);
    }
  }, [activatingConnector, ethConnector]);

  const ethButtonClass =
    'px-4 py-2 font-bold text-white uppercase rounded ' +
    (ethError
      ? 'bg-red-700 hover:bg-red-700'
      : hasMetaMask()
      ? 'bg-gray-800 hover:bg-gray-700'
      : 'text-gray-500 bg-gray-700  cursor-default');

  return (
    <div className="w-full">
      <div className="flex flex-col w-full h-screen">
        <div className="w-full p-5 text-2xl font-bold">
          <FontAwesomeIcon icon={faPrayingHands} size="1x" className="m-2" />
        </div>
        <div className="flex flex-col items-center p-4 py-8 m-auto border border-solid rounded-lg shadow-sm bg-gray-50 w-96">
          <div className="mb-3 text-xl font-semibold">Login</div>
          <div className="mb-3 text-center">
            To login to praise, first connect a wallet and then sign a
            verification message.
          </div>
          <div className="mb-3 text-lg font-semibold ">1. Connect</div>
          <EthAccount />
          {ethState.triedEager &&
            (!ethState.connected || (ethState.connected && !!ethError)) && (
              <div className="mb-5">
                <button
                  className={ethButtonClass}
                  disabled={
                    ethState.connectDisabled ||
                    !!ethError ||
                    activating ||
                    !hasMetaMask()
                  }
                  key={'Injected'}
                  onClick={() => {
                    setActivatingConnector(injected);
                    void ethActivate(injected, (error) => {
                      if (error.name === 'UnsupportedChainIdError')
                        alert('Please connect to Ethereum mainnet');
                      setActivatingConnector(undefined);
                    });
                  }}
                >
                  {!ethError && activating && <div>Initializing …</div>}
                  {!ethError && !activating && (
                    <div>
                      <MetamaskIcon
                        className={'inline-block w-4 h-4 pb-1 mr-2'}
                      />
                      Connect to a wallet
                    </div>
                  )}
                  {ethError && ethError.name === 'UnsupportedChainIdError' && (
                    <div>Wrong network</div>
                  )}
                  {ethError && ethError.name !== 'UnsupportedChainIdError' && (
                    <div>Unable to connect</div>
                  )}
                </button>
                {!hasMetaMask() && (
                  <div className="mt-3 text-center text-red-500">
                    No MetaMask installed
                  </div>
                )}
              </div>
            )}
          <div className="mb-3 text-lg font-semibold">2. Login</div>
          <LoginButton />
        </div>
      </div>
    </div>
  );
}
