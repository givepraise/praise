import {
  AccountActivated,
  AccountActivateQuery,
  isApiResponseOk,
  useAuthApiQuery,
} from "@/model/api";
import { useWeb3React } from "@web3-react/core";
import queryString from "query-string";
import React from "react";
import { useLocation } from "react-router-dom";
import { useSetRecoilState } from "recoil";

const generateLoginMessage = (
  accountId: string,
  ethereumAddress: string,
  token: string
): string => {
  return (
    "SIGN THIS MESSAGE TO ACTIVATE YOUR ACCOUNT.\n\n" +
    `ACCOUNT ID:\n${accountId}\n\n` +
    `ADDRESS:\n${ethereumAddress}\n\n` +
    `TOKEN:\n${token}`
  );
};

export default function ActivateButton() {
  const ActivateButtonInner = () => {
    const { account: ethereumAddress, library: ethLibrary } = useWeb3React();
    const [message, setMessage] = React.useState<string | any>(undefined);
    const [signature, setSignature] = React.useState<string | any>(undefined);
    const { search } = useLocation();
    const { accountId, token } = queryString.parse(search);
    const setAccountActivated = useSetRecoilState(AccountActivated);

    // 3. Verify signature with server
    const activateResponse = useAuthApiQuery(
      AccountActivateQuery({ ethereumAddress, accountId, message, signature })
    );

    // 1. Generate login message to sign
    React.useEffect(() => {
      if (!ethereumAddress || !accountId || !token) return;
      setMessage(
        generateLoginMessage(
          accountId.toString(),
          ethereumAddress,
          token.toString()
        )
      );
    }, [ethereumAddress, accountId, token]);

    // 4. Account activated
    React.useEffect(() => {
      if (isApiResponseOk(activateResponse)) setAccountActivated(true);
    }, [activateResponse, setAccountActivated]);

    const signLoginMessage = async () => {
      // 2. Sign the message using Metamask
      const _signature: any = await ethLibrary.getSigner().signMessage(message);
      if (_signature) setSignature(_signature);
    };

    return (
      <div>
        <button
          className="px-4 py-2 font-bold text-white uppercase bg-black rounded hover:bg-gray-700"
          onClick={signLoginMessage}
        >
          Sign activation message
        </button>
      </div>
    );
  };

  return (
    <React.Suspense fallback={null}>
      <ActivateButtonInner />
    </React.Suspense>
  );
}
