import { AxiosError, AxiosResponse } from 'axios';
import { selector } from 'recoil';
import { ApiGet, isResponseOk } from '../api';
import { Community } from './dto/community.dto';

export const CurrentCommunityQuery = selector({
  key: 'CurrentCommunity',
  get: ({ get }): AxiosResponse<Community> | AxiosError => {
    return get(ApiGet({ url: '/communities/current' })) as
      | AxiosResponse<Community>
      | AxiosError;
  },
});

export const CurrentCommunity = selector({
  key: 'AllReports',
  get: ({ get }): Community | undefined => {
    const response = get(CurrentCommunityQuery);

    if (isResponseOk(response)) {
      return response.data;
    }

    return;
  },
});
