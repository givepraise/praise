import AllUsers from "@/components/AllUsers";
import { isConnected } from "@/eth/connectors";
import { loadSessionToken } from "@/spring/auth";
import { useWeb3React } from "@web3-react/core";
import { Link } from "react-router-dom";

const MainPage = () => {
  const {
    error: ethError,
    account: ethAccount,
    connector: ethConnector,
  } = useWeb3React();

  const sessionId = loadSessionToken(ethAccount);

  return (
    <>
      <div className="max-w-lg overflow-auto text-white wall-container ">
        {isConnected(ethConnector) && !ethError && sessionId && (
          <div>You are connected.</div>
        )}
        {(!isConnected(ethConnector) || ethError || !sessionId) && (
          <div>
            You are not connected.{" "}
            <Link to="/login?r=/" className="underline">
              Connect your wallet
            </Link>{" "}
            and login please.
          </div>
        )}
      </div>
      <div className="max-w-lg mt-5 text-white wall-container">
        <AllUsers />
      </div>
    </>
  );
};

export default MainPage;
