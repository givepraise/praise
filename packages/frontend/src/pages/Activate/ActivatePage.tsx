import EthAccount from '@/components/EthAccount';
import LoaderSpinner from '@/components/LoaderSpinner';
import Notice from '@/components/Notice';
import { injected } from '@/eth/connectors';
import { hasMetaMask } from '@/eth/wallet';
import { AccountActivated } from '@/model/activate';
import { EthState } from '@/model/eth';
import { ReactComponent as MetamaskIcon } from '@/svg/metamask.svg';
import { faPrayingHands } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import queryString from 'query-string';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import ActivateButton from './components/ActivateButton';

const ActivateSuccessful = (): JSX.Element => {
  const { search } = useLocation();
  const { platform } = queryString.parse(search);

  return (
    <div className="flex h-screen">
      <div className="m-auto text-center">
        <FontAwesomeIcon icon={faPrayingHands} size="2x" />
        <br />
        <h2 className="mt-3">
          Your {platform === 'DISCORD' ? 'Discord' : 'Telegram'} account has
          been activated!
        </h2>
        <div className="mt-3">You can now close this window or tab.</div>
      </div>
    </div>
  );
};

const ActivateDialog = (): JSX.Element => {
  const { search } = useLocation();
  const { accountName, platform } = queryString.parse(search);
  const {
    error: ethError,
    connector: ethConnector,
    activate: ethActivate,
  } = useWeb3React();

  const ethState = useRecoilValue(EthState);
  const [errorNotice, setErrorNotice] = useState<string | undefined>(undefined);

  // Marks which ethConnector is being activated
  const [activatingConnector, setActivatingConnector] = React.useState<
    InjectedConnector | undefined
  >(undefined);

  // handle logic to recognize the ethConnector currently being activated
  React.useEffect(() => {
    if (activatingConnector && activatingConnector === ethConnector) {
      setActivatingConnector(undefined);
    }
  }, [activatingConnector, ethConnector]);

  useEffect(() => {
    if (!ethState.account && !hasMetaMask()) {
      setErrorNotice('MetaMask not found. Please install MetaMask to login.');
    } else if (ethError && ethError.name === 'UnsupportedChainIdError') {
      setErrorNotice('Wrong network');
    } else if (ethError && ethError.name !== 'UnsupportedChainIdError') {
      setErrorNotice('Unable to connect. Is Metamask installed?');
    } else {
      setErrorNotice(undefined);
    }
  }, [ethState, ethError]);

  return (
    <div className="w-full">
      <div className="flex flex-col w-full h-screen">
        <div className="w-full p-5 text-2xl font-bold">
          <FontAwesomeIcon icon={faPrayingHands} size="1x" className="m-2" />
        </div>
        <div className="flex flex-col items-center p-4 py-8 m-auto border border-solid rounded-lg shadow-sm bg-gray-50 w-96">
          <div className="mb-2 text-xl font-semibold text-center">Activate</div>
          <div className="mb-3 text-center">
            Activate your {platform === 'DISCORD' ? 'Discord' : 'Telegram'}{' '}
            account and link with an Ethereum address.{' '}
          </div>
          <div className="mb-3 text-center">Account: {accountName}</div>
          <div className="flex flex-col justify-center my-4 space-y-3">
            {errorNotice && (
              <Notice type="danger">
                <span>{errorNotice}</span>
              </Notice>
            )}

            {!ethState.account && !ethState.activating && (
              <div className="flex flex-col justify-center space-y-6">
                {!ethState.triedEager && (
                  <div className="flex items-center justify-center">
                    <LoaderSpinner />
                    <span>Initializing... </span>
                  </div>
                )}

                <div>
                  <div className="flex justify-center">
                    {!hasMetaMask() ? (
                      <button
                        className="inline-block px-4 py-2 font-bold text-white uppercase bg-gray-700 rounded cursor-default"
                        disabled
                      >
                        <div>
                          <MetamaskIcon
                            className={'inline-block w-4 h-4 pb-1 mr-2'}
                          />
                          Connect to a wallet
                        </div>
                      </button>
                    ) : (
                      <button
                        className="inline-block px-4 py-2 font-bold text-white uppercase bg-gray-800 rounded hover:bg-gray-700"
                        key={'Injected'}
                        disabled={!hasMetaMask()}
                        onClick={(): void => {
                          setActivatingConnector(injected);
                          void ethActivate(injected, (error) => {
                            if (error.name === 'UnsupportedChainIdError')
                              alert('Please connect to Ethereum mainnet');

                            toast.error(error.message);
                            setActivatingConnector(undefined);
                          });
                        }}
                      >
                        <div>
                          <MetamaskIcon
                            className={'inline-block w-4 h-4 pb-1 mr-2'}
                          />
                          Connect to a wallet
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {ethState.account && !ethState.activating && (
              <div className="flex flex-col justify-center space-y-6">
                <div>
                  <div className="mb-2 text-lg font-semibold text-center">
                    Connected as
                  </div>
                  <EthAccount />
                </div>

                <div>
                  <ActivateButton />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ActivatePage(): JSX.Element {
  const accountActivated = useRecoilValue(AccountActivated);

  return accountActivated ? <ActivateSuccessful /> : <ActivateDialog />;
}
