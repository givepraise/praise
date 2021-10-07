import { injected } from "@/eth/connectors";
import { useEagerConnect, useInactiveListener } from "@/eth/hooks";
import { EthState } from "@/store/index";
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import React from "react";
import { Link } from "react-router-dom";
import { useSetRecoilState } from "recoil";

export default function Header() {
  const {
    error: ethError,
    connector: ethConnector,
    account: ethAccount,
  } = useWeb3React();

  // Attempt to activate pre-existing connection
  const triedEager = useEagerConnect();

  // Marks which ethConnector is being activated
  const [activatingConnector, setActivatingConnector] = React.useState<
    InjectedConnector | undefined
  >(undefined);

  const activating = injected === activatingConnector;
  const connected = injected === ethConnector;
  const connectDisabled = !triedEager || activating || connected || !!ethError;

  // Listen to and react to network events
  useInactiveListener(!triedEager || !!activatingConnector);

  // Handle logic to recognize the ethConnector currently being activated
  React.useEffect(() => {
    if (activatingConnector && activatingConnector === ethConnector) {
      setActivatingConnector(undefined);
    }
  }, [activatingConnector, ethConnector]);

  // Store current eth address and connection state in global state
  const setEthState = useSetRecoilState(EthState);
  React.useEffect(() => {
    setEthState({
      account: ethAccount,
      triedEager,
      activating,
      connected,
      connectDisabled,
    });
  }, [
    setEthState,
    ethAccount,
    triedEager,
    activating,
    connected,
    connectDisabled,
  ]);

  return (
    <nav>
      <div className="px-2 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8 sm:py-6 lg:py-8">
        <div className="flex flex-col items-center">
          <div className="flex items-center flex-shrink-0 text-3xl font-bold text-white">
            <Link to="/">Praise 🙏</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
