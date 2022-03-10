import { AuthResponse, NonceResponse } from 'api/dist/auth/types';
import { TokenSet, ActiveTokenSet, RefreshToken } from '../model/auth';
import { makeApiClient } from './api';
import { getRecoil, setRecoil } from 'recoil-nexus';

export type AuthQueryParams = {
  ethereumAddress: string | null | undefined;
  message: string | undefined;
  signature: string | undefined;
};

export const requestApiAuth = async (
  params: AuthQueryParams
): Promise<TokenSet | undefined> => {
  const apiClient = makeApiClient();
  const response = await apiClient.post('/auth', params);
  if (!response) throw Error('Failed to request authorization');

  const { accessToken: sessionToken, refreshToken } =
    response.data as unknown as AuthResponse;

  setRecoil(ActiveTokenSet, {
    sessionToken,
    refreshToken,
  });

  return getRecoil(ActiveTokenSet);
};

export const requestApiAuthRefresh = async (): Promise<
  TokenSet | undefined
> => {
  const refreshToken = getRecoil(RefreshToken);

  const apiClient = makeApiClient();
  const response = await apiClient.post('auth/refresh', {
    refreshToken,
  });
  const { accessToken: sessionToken, refreshToken: newRefreshToken } =
    response.data as AuthResponse;
  if (!sessionToken || !newRefreshToken) {
    setRecoil(ActiveTokenSet, undefined);
    throw Error('Refresh token has expired');
  }

  const newTokenSet = {
    sessionToken,
    refreshToken: newRefreshToken,
  };
  setRecoil(ActiveTokenSet, newTokenSet);

  return newTokenSet;
};

export const requestNonce = async (
  ethereumAddress: string
): Promise<string> => {
  const apiClient = makeApiClient();

  const response = await apiClient.get('/auth/nonce', {
    params: { ethereumAddress },
  });

  const { nonce } = response.data as NonceResponse;

  return nonce;
};
