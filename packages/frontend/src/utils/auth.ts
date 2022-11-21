import {
  AuthRequestInput,
  AuthResponse,
  NonceResponse,
  TokenSet,
} from 'api/dist/auth/types';
import { ActivateRequestBody } from 'api/dist/activate/types';
import { getRecoil, setRecoil } from 'recoil-nexus';
import { ActiveTokenSet } from '@/model/auth';
import { AccountActivated } from '@/model/activate';
import { makeApiClient } from './api';

export const requestApiAuth = async (
  params: AuthRequestInput
): Promise<TokenSet | undefined> => {
  const apiClient = makeApiClient();
  const response = await apiClient.post('/auth/login', params);
  if (!response) throw Error('Failed to request authorization');

  const { accessToken, refreshToken } =
    response.data as unknown as AuthResponse;

  setRecoil(ActiveTokenSet, {
    accessToken,
    refreshToken,
  });

  return getRecoil(ActiveTokenSet);
};

export const requestApiAuthRefresh = async (): Promise<
  TokenSet | undefined
> => {
  const tokenSet = getRecoil(ActiveTokenSet);

  try {
    const apiClient = makeApiClient();
    const response = await apiClient.post('/auth/refresh', {
      refreshToken: tokenSet?.refreshToken,
    });
    const { accessToken, refreshToken: newRefreshToken } =
      response.data as AuthResponse;

    const newTokenSet = {
      accessToken,
      refreshToken: newRefreshToken,
    };
    setRecoil(ActiveTokenSet, newTokenSet);

    return newTokenSet;
  } catch (err) {
    setRecoil(ActiveTokenSet, undefined);
    throw Error('Refresh token has expired');
  }
};

export const requestNonce = async (
  identityEthAddress: string
): Promise<string> => {
  const apiClient = makeApiClient();

  const response = await apiClient.get('/auth/nonce', {
    params: { identityEthAddress },
  });

  const { nonce } = response.data as NonceResponse;

  return nonce;
};

export const requestApiActivate = async (
  params: ActivateRequestBody
): Promise<boolean> => {
  const { identityEthAddress, accountId, message, signature } = params;
  const apiClient = makeApiClient();
  const response = await apiClient.post('/activate', {
    identityEthAddress,
    accountId,
    message,
    signature,
  });

  setRecoil(AccountActivated, !!response.data);

  return getRecoil(AccountActivated);
};
