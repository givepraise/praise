import EthAccount from "@/components/login/EthAccount";
import Login from "@/components/login/Login";
import { injected } from "@/eth/connectors";
import { EthState } from "@/store/eth";
import { ReactComponent as MetamaskIcon } from "@/svg/metamask.svg";
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import React from "react";
import { useRecoilValue } from "recoil";

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

  let ethButtonClass =
    "inline-block px-3 py-2 text-base font-semibold uppercase rounded-lg focus:outline-none " +
    (ethError
      ? "bg-red-700 hover:bg-red-700 text-white"
      : "bg-gray-400 text-white");

  return (
    <div className="w-full">
      <div className="flex flex-col w-full h-screen">
        <div className="w-full p-5 text-2xl font-bold">Praise 🙏</div>
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
                    ethState.connectDisabled || !!ethError || activating
                  }
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
          <div className="mb-3 text-lg font-semibold">2. Login</div>
          <Login />
        </div>
      </div>
    </div>
  );
}
