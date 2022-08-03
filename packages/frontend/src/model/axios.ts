import { AxiosResponse } from 'axios';
import { selectorFamily } from 'recoil';

import { makeClient } from '@/utils/axios';

import { RequestParams } from './api';

/**
 * External GET request
 */
export const ExternalGet = selectorFamily<
  AxiosResponse<unknown>,
  RequestParams
>({
  key: 'ExternalGet',
  get: (params: RequestParams) => async (): Promise<AxiosResponse<unknown>> => {
    const { config, url } = params;

    const client = makeClient();
    const response = await client.get(url, config);

    return response;
  },
});
