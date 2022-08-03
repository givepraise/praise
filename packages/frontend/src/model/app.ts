import { AxiosResponse } from 'axios';
import { selector, useRecoilValue } from 'recoil';

import { isResponseOk } from './api';
import { ExternalGet } from './axios';

export interface GithubResponse {
  name: string;
}

export const GithubVersionQuery = selector({
  key: 'GithubVersionQuery',
  get: ({ get }): AxiosResponse<GithubResponse> => {
    const repoOwner = process.env.REACT_APP_GITHUB_REPO_OWNER;
    const repoName = process.env.REACT_APP_GITHUB_REPO_NAME;

    return get(
      ExternalGet({
        url: `https://api.github.com/repos/${repoOwner}/${repoName}/releases/latest`,
      })
    ) as AxiosResponse<GithubResponse>;
  },
});

interface PraiseAppVersion {
  current: string | undefined;
  latest: string | undefined;
  newVersionAvailable: boolean;
}

export const usePraiseAppVersion = (): PraiseAppVersion => {
  const appVersion: PraiseAppVersion = {
    current: process.env.REACT_APP_VERSION,
    latest: undefined,
    newVersionAvailable: false,
  };

  const response = useRecoilValue(GithubVersionQuery);
  if (isResponseOk(response)) {
    appVersion.latest = response.data.name.substring(1);
    appVersion.newVersionAvailable = appVersion.latest !== appVersion.current;
  }

  return appVersion;
};
