import { getRecoil, setRecoil } from 'recoil-nexus';
import { ActiveTokenSet } from '@/model/auth/auth';
import { AccountActivated } from '@/model/activate/activate';
import { makeApiClient } from './api';
import { LoginInputDto } from '@/model/auth/dto/auth-request.dto';
import { ActivateInputDto } from '@/model/activate/dto/activate-request-body.dto';
import { TokenSet } from '@/model/auth/interfaces/token-set.interface';
import { LoginResponseDto } from '@/model/auth/dto/auth-response.dto';
import { NonceResponseDto } from '@/model/auth/dto/nonce-response.dto';

export const requestApiAuth = async (
  params: LoginInputDto
): Promise<TokenSet | undefined> => {
  const apiClient = makeApiClient();
  const response = await apiClient.post('/auth/eth-signature/login', params);
  if (!response) throw Error('Failed to request authorization');

  const { accessToken } = response.data as unknown as LoginResponseDto;

  setRecoil(ActiveTokenSet, {
    accessToken,
  });

  return getRecoil(ActiveTokenSet);
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
