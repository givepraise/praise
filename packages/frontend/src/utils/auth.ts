import { getRecoil, setRecoil } from 'recoil-nexus';
import { ActiveTokenSet } from '@/model/auth/auth';
import { AccountActivated } from '@/model/activate/activate';
import { makeApiClient } from './api';
import { LoginInputDto } from '@/model/auth/dto/login-input.dto';
import { ActivateInputDto } from '@/model/activate/dto/activate-input.dto';
import { TokenSet } from '@/model/auth/interfaces/token-set.interface';
import { LoginResponseDto } from '@/model/auth/dto/login-response.dto';
import { NonceResponseDto } from '@/model/auth/dto/nonce-response.dto';
import { RefreshTokenInputDto } from '@/model/auth/dto/refresh-token-input-dto';
import { isResponseOk } from '../model/api';

export const requestApiAuth = async (
  params: LoginInputDto
): Promise<TokenSet | undefined> => {
  const apiClient = makeApiClient();
  const response = await apiClient.post('/auth/eth-signature/login', params);
  if (isResponseOk<LoginResponseDto>(response)) {
    const { accessToken, refreshToken } = response.data;

    setRecoil(ActiveTokenSet, {
      accessToken,
      refreshToken,
    });

    return getRecoil(ActiveTokenSet);
  }
};

export const requestApiRefreshToken = async (
  params: RefreshTokenInputDto
): Promise<TokenSet | undefined> => {
  const apiClient = makeApiClient(false);
  const response = await apiClient.post('/auth/eth-signature/refresh', params);
  if (isResponseOk<LoginResponseDto>(response)) {
    const { accessToken, refreshToken } = response.data;

    setRecoil(ActiveTokenSet, {
      accessToken,
      refreshToken,
    });

    return getRecoil(ActiveTokenSet);
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
  params: ActivateInputDto
): Promise<boolean> => {
  const { identityEthAddress, accountId, signature } = params;
  const apiClient = makeApiClient();
  const response = await apiClient.post('/activate', {
    identityEthAddress,
    accountId,
    signature,
  });

  setRecoil(AccountActivated, !!response.data);

  return getRecoil(AccountActivated);
};
