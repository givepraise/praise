import {
  AccountActivated,
  AccountActivateQuery,
  ActivateRequestBodySerializable,
} from '@/model/activate';
import { isResponseOk } from '@/model/api';
import { useWeb3React } from '@web3-react/core';
import { AxiosResponse } from 'axios';
import queryString from 'query-string';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { useRecoilCallback, useSetRecoilState } from 'recoil';

const generateLoginMessage = (
  accountId: string,
  ethereumAddress: string,
  token: string
): string => {
  return (
    'SIGN THIS MESSAGE TO ACTIVATE YOUR ACCOUNT.\n\n' +
    `ACCOUNT ID:\n${accountId}\n\n` +
    `ADDRESS:\n${ethereumAddress}\n\n` +
    `TOKEN:\n${token}`
  );
};

export default function ActivateButton(): JSX.Element {
  const ActivateButtonInner = (): JSX.Element => {
    const { account: ethereumAddress, library: ethLibrary } = useWeb3React();
    const [message, setMessage] = React.useState<string | undefined>(undefined);
    const [signature, setSignature] = React.useState<string | undefined>(
      undefined
    );
    const [activateResponse, setActivateResponse] = React.useState<
      AxiosResponse<unknown> | undefined
    >(undefined);
    const { search } = useLocation();
    const { accountId, token } = queryString.parse(search);
    const setAccountActivated = useSetRecoilState(AccountActivated);

    // 3. Verify signature with server
    const activateAccount = useRecoilCallback(
      ({ snapshot }) =>
        async (
          params: ActivateRequestBodySerializable
        ): Promise<AxiosResponse<unknown>> => {
          const { ethereumAddress, accountId, message, signature } = params;
          const response = await snapshot.getPromise(
            AccountActivateQuery({
              ethereumAddress,
              accountId,
              message,
              signature,
            })
          );
          return response;
        },
      [ethereumAddress, accountId, message, signature]
    );
    React.useEffect(() => {
      if (
        !ethereumAddress ||
        !accountId ||
        Array.isArray(accountId) ||
        !message ||
        !signature
      )
        return;

      void (async (): Promise<void> => {
        const response = await activateAccount({
          ethereumAddress,
          accountId,
          message,
          signature,
        });
        if (isResponseOk(response)) {
          setActivateResponse(response);
        }
      })();
    }, [ethereumAddress, accountId, message, signature, activateAccount]);

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
      if (isResponseOk(activateResponse)) setAccountActivated(true);
    }, [activateResponse, setAccountActivated]);

    const signLoginMessage = async (): Promise<void> => {
      // 2. Sign the message using Metamask
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const _signature: any = await ethLibrary.getSigner().signMessage(message); //TODO better type handling for useWeb3React
      if (_signature) setSignature(_signature);
    };

    const handleSignButtonClick = (): void => {
      void signLoginMessage();
    };

    return (
      <div>
        <button
          className="px-4 py-2 font-bold text-white uppercase bg-gray-800 rounded hover:bg-gray-700"
          onClick={handleSignButtonClick}
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
