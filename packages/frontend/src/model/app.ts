import { AxiosResponse } from 'axios';
import { selector, selectorFamily, useRecoilValue } from 'recoil';
import { makeClient } from '@/utils/app';
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

export const GithubVersionQuery = selector({
  key: 'GithubVersionQuery',
  get: ({ get }) => {
    const repoOwner = process.env.REACT_APP_GITHUB_REPO_OWNER;
    const repoName = process.env.REACT_APP_GITHUB_REPO_NAME;

    return get(
      ExternalGet({
        url: `https://api.github.com/repos/${repoOwner}/${repoName}/releases/latest`,
      })
    );
  },
});

interface GithubResponse {
  name: string;
}

export const useGithubVersionQuery = (): string => {
  const githubVersionResponse = useRecoilValue(GithubVersionQuery);
  const githubResponse = githubVersionResponse.data as GithubResponse;

  return githubResponse.name;
};
