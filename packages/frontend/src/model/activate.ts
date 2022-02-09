import { ActivateRequestBody } from 'api/dist/activate/types';
import { AxiosResponse } from 'axios';
import { atom, selectorFamily, SerializableParam } from 'recoil';
import { ApiPost } from './api';

export const AccountActivated = atom<boolean>({
  key: 'AccountActivated',
  default: false,
});

export interface ActivateRequestBodySerializable extends ActivateRequestBody {
  [key: string]: SerializableParam;
}
export const AccountActivateQuery = selectorFamily<
  AxiosResponse<unknown>,
  ActivateRequestBodySerializable
>({
  key: 'AccountActivateQuery',
  get:
    (params: ActivateRequestBody) =>
    ({ get }): AxiosResponse<unknown> => {
      const { ethereumAddress, accountId, message, signature } = params;
      if (!ethereumAddress || !accountId || !message || !signature)
        throw new Error('Invalid activation request.');

      const data = JSON.stringify({
        ethereumAddress,
        accountId,
        message,
        signature,
      });

      const response = get(ApiPost({ url: '/api/activate', data }));
      return response;
    },
});
