import { generateLoginMessage, saveSession } from "@/spring/auth";
import { AuthQuery, NonceQuery } from "@/store/index";
import { useWeb3React } from "@web3-react/core";
import React from "react";
import { useRecoilValue } from "recoil";

export default function LoginButton() {
  const LoginButtonInner = () => {
    const { account: ethAccount, library: ethLibrary } = useWeb3React();
    const [message, setMessage] = React.useState<string | any>(undefined);
    const [signature, setSignature] = React.useState<string | any>(undefined);

    // 1. Fetch nonce from server
    const nonce = useRecoilValue(NonceQuery({ ethAccount }));

    // 4. Verify signature with server
    const session = useRecoilValue(
      AuthQuery({ ethAccount, message, signature })
    );

    // 2. Generate login message to sign
    React.useEffect(() => {
      if (!ethAccount || !nonce) return;
      setMessage(generateLoginMessage(ethAccount, nonce));
    }, [ethAccount, nonce]);

    // 5. Save session id for future api calls
    React.useEffect(() => {
      if (!ethAccount || !session) return;
      console.log(JSON.stringify(session));
      saveSession(ethAccount, session);
    }, [ethAccount, session]);

    const signLoginMessage = async () => {
      // 3. Sign the message using Metamask
      const _signature: any = await ethLibrary.getSigner().signMessage(message);
      if (_signature) setSignature(_signature);
    };

    if (!nonce)
      return (
        <div>
          <button className="inline-block px-3 py-2 text-base font-semibold text-gray-700 uppercase bg-gray-500 rounded-lg">
            Sign login message
          </button>
        </div>
      );

    return (
      <div>
        <button
          className="inline-block px-3 py-2 text-base font-semibold text-white uppercase bg-green-700 rounded-lg"
          onClick={signLoginMessage}
        >
          Sign login message
        </button>
      </div>
    );
  };

  return (
    <React.Suspense fallback={null}>
      <LoginButtonInner />
    </React.Suspense>
  );
}
