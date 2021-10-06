import AllUsers from "@/components/AllUsers";
import { isConnected } from "@/eth/connectors";
import { loadSession } from "@/spring/auth";
import { useWeb3React } from "@web3-react/core";
import { Link } from "react-router-dom";

const MainPage = () => {
  const {
    error: ethError,
    account: ethAccount,
    connector: ethConnector,
  } = useWeb3React();

  const sessionId = loadSession(ethAccount!);

  return (
    <>
      <div className="text-white wall-container">
        {isConnected(ethConnector) && !ethError && sessionId && (
          <div>
            You are connected to the server, your session id is: "{sessionId}"
          </div>
        )}

        {(!isConnected(ethConnector) || ethError || !sessionId) && (
          <div>
            You are not connected. <Link to="/login">Connect your wallet</Link>{" "}
            and login please.
          </div>
        )}
      </div>
      <div className="text-white wall-container">
        <AllUsers />
      </div>
    </>
  );
};

export default MainPage;
