import { isConnected } from "@/eth/connectors";
import { generateLoginMessage, loadSession, saveSession } from "@/spring/auth";
import { useWeb3React } from "@web3-react/core";
export default function LoginButton() {
  const {
    error: ethError,
    account: ethAccount,
    connector: ethConnector,
    library: ethLibrary,
  } = useWeb3React();
  const sessionId = loadSession(ethAccount!);

  const dummyFetchNonce = () => {
    return "NONCE123";
  };

  const dummyVerifySignature = (signature: string) => {
    return "JWT_SESSION_ID";
  };

  const loginToPraise = async () => {
    // 1. Fetch current nonce from server
    let nonce = dummyFetchNonce();

    // 2. Generate login message to sign
    const loginMessage = generateLoginMessage(ethAccount!, nonce);

    // 3. Sign the message using Metamask
    const signature: any = await ethLibrary
      .getSigner()
      .signMessage(loginMessage);

    // 4. Verify signature with server
    const jwtSession = dummyVerifySignature(signature);

    // 5. Save session id for future api calls
    saveSession(ethAccount!, jwtSession);
  };

  return (
    <>
      {isConnected(ethConnector) && !ethError && !sessionId && (
        <button
          className="inline-block px-3 py-2 mr-4 text-base font-semibold text-white uppercase bg-green-700 rounded-lg"
          onClick={loginToPraise}
        >
          Login to Praise
        </button>
      )}
    </>
  );
}
