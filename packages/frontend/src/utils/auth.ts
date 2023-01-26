import { getRecoil, setRecoil } from 'recoil-nexus';
import { ActiveTokenSet } from '@/model/auth/auth';
import { AccountActivated } from '@/model/activate/activate';
import { makeApiClient } from './api';
import { AuthRequestInputDto } from 'shared/dto/auth-request.dto';
import { TokenSet } from 'shared/interfaces/token-set.interface';
import { AuthResponseDto } from 'shared/dto/auth-response.dto';
import { NonceResponseDto } from 'shared/dto/nonce-response.dto';
import { ActivateRequestBodyDto } from 'shared/dto/activate-request-body.dto';

export const requestApiAuth = async (
  params: AuthRequestInputDto
): Promise<TokenSet | undefined> => {
  const apiClient = makeApiClient();
  const response = await apiClient.post('/auth/eth-signature/login', params);
  if (!response) throw Error('Failed to request authorization');

  const { accessToken, refreshToken } =
    response.data as unknown as AuthResponseDto;

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
      response.data as AuthResponseDto;

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

  const response = await apiClient.post('/auth/eth-signature/nonce', {
    identityEthAddress,
  });

  const { nonce } = response.data as NonceResponseDto;

  return nonce;
};

export const requestApiActivate = async (
  params: ActivateRequestBodyDto
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
