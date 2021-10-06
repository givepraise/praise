import EthAccount from "@/components/login/EthAccount";
import Login from "@/components/login/Login";
import { injected } from "@/eth/connectors";
import { useEagerConnect, useInactiveListener } from "@/eth/hooks";
import { loadSession } from "@/spring/auth";
import { ReactComponent as MetamaskIcon } from "@/svg/metamask.svg";
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import React from "react";

export default function LoginPage() {
  const {
    error: ethError,
    connector: ethConnector,
    account: ethAccount,
    activate: ethActivate,
  } = useWeb3React();
  const sessionId = loadSession(ethAccount!);

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

  // handle logic to recognize the ethConnector currently being activated
  React.useEffect(() => {
    if (activatingConnector && activatingConnector === ethConnector) {
      setActivatingConnector(undefined);
    }
  }, [activatingConnector, ethConnector]);

  let ethButtonClass =
    "inline-block px-3 py-2 text-base font-semibold uppercase rounded-lg focus:outline-none " +
    (ethError
      ? "bg-red-700 hover:bg-red-700 text-white"
      : "bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-green-900");

  return (
    <div className="flex flex-col items-center text-white wall-container mt-72">
      <EthAccount />
      {triedEager && (!connected || (connected && !!ethError)) && (
        <div className="mb-5">
          <button
            className={ethButtonClass}
            disabled={connectDisabled || !!ethError || activating}
            key={"Injected"}
            onClick={() => {
              setActivatingConnector(injected);
              ethActivate(injected, (error) => {
                if (error.name === "UnsupportedChainIdError")
                  alert("Please connect to Ethereum mainnet");
                setActivatingConnector(undefined);
              });
            }}
          >
            {!ethError && activating && <div>Initializing …</div>}
            {!ethError && !activating && (
              <div>
                <MetamaskIcon className="inline-block w-4 h-4 pb-1 mr-2" />
                Connect to a wallet
              </div>
            )}
            {ethError && ethError.name === "UnsupportedChainIdError" && (
              <div>Wrong network</div>
            )}
            {ethError && ethError.name !== "UnsupportedChainIdError" && (
              <div>Unable to connect</div>
            )}
          </button>
        </div>
      )}
      <Login />
    </div>
  );
}
