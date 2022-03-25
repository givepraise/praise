import { AuthResponse, NonceResponse, TokenSet } from 'api/dist/auth/types';
import { ActiveTokenSet, RefreshToken } from '../model/auth';
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
  const refreshToken = getRecoil(RefreshToken);

  try {
    const apiClient = makeApiClient();
    const response = await apiClient.post('auth/refresh', {
      refreshToken,
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
  ethereumAddress: string
): Promise<string> => {
  const apiClient = makeApiClient();

  const response = await apiClient.get('/auth/nonce', {
    params: { ethereumAddress },
  });

  const { nonce } = response.data as NonceResponse;

  return nonce;
};
