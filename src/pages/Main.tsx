import { isConnected } from "@/eth/connectors";
import { loadSession } from "@/spring/auth";
import { useWeb3React } from "@web3-react/core";

const MainPage = () => {
  const {
    error: ethError,
    account: ethAccount,
    connector: ethConnector,
  } = useWeb3React();

  const sessionId = loadSession(ethAccount!);

  return (
    <div className="text-white wall-container">
      {isConnected(ethConnector) && !ethError && sessionId && (
        <div>
          You are connected to the (dummy) server, your session id is: "
          {sessionId}"
        </div>
      )}

      {(!isConnected(ethConnector) || ethError || !sessionId) && (
        <div>You are not connected. Connect your wallet and login please.</div>
      )}
    </div>
  );
};

export default MainPage;
