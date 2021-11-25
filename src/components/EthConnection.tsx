import { injected } from "@/eth/connectors";
import { useEagerConnect, useInactiveListener } from "@/eth/hooks";
import { EthState } from "@/model/eth";
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import React from "react";
import { useSetRecoilState } from "recoil";

export default function EthConnection() {
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

  // This allows us to stub out the Metamask extension in a test environment
  // Waiting on Cypress for feedback on a better solution on stubbing out the connector
  var envDependentConnectionStatus: boolean;
  var envDependentAccount: string | null | undefined;

  if (process.env.NODE_ENV === "test") {
    envDependentAccount = process.env.REACT_APP_ETH_ADDRESS;
    envDependentConnectionStatus = true;
  } else {
    envDependentAccount = ethAccount;
    envDependentConnectionStatus = connected;
  }
  // End of testing conditional

  // Store current eth address and connection state in global state
  const setEthState = useSetRecoilState(EthState);
  React.useEffect(() => {
    setEthState({
      // account: ethAccount, //Switch back to ethAccount after conditional stub above has been removed
      account: envDependentAccount,
      triedEager,
      activating,
      // connected,  //Switch back to connected after conditional stub above has been removed
      connected: envDependentConnectionStatus,
      connectDisabled,
    });
  }, [
    setEthState,
    ethAccount,
    triedEager,
    activating,
    connected,
    connectDisabled,
    envDependentAccount,
    envDependentConnectionStatus,
  ]);

  return null;
}
