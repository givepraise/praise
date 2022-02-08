import { ActivateRequestBody } from 'api/dist/activate/types';
import { atom, selectorFamily, SerializableParam } from 'recoil';
import { ApiPost, isResponseOk } from './api';
import { User } from './users';

export const AccountActivated = atom<boolean>({
  key: 'AccountActivated',
  default: false,
});

interface ActivateRequestBodySerializable extends ActivateRequestBody {
  [key: string]: SerializableParam;
}
export const AccountActivateQuery = selectorFamily<
  User | undefined,
  ActivateRequestBodySerializable
>({
  key: 'AccountActivateQuery',
  get:
    (params: ActivateRequestBody) =>
    ({ get }): User | undefined => {
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
      if (isResponseOk(response)) {
        return response.data as User;
      }
    },
});
