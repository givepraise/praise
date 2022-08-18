import { AxiosResponse } from 'axios';
import { atomFamily, selector, useRecoilValue } from 'recoil';
import { recoilPersist } from 'recoil-persist';
import { isResponseOk } from './api';
import { ExternalGet } from './axios';

const { persistAtom } = recoilPersist();

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

export const IsHeaderBannerClosed = atomFamily<boolean, string>({
  key: 'IsHeaderBannerClosed',
  default: false,
  effects: [persistAtom],
});

export const AragonTransformerQuery = selector({
  key: 'AragonTransformerQuery',
  get: ({ get }) => {
    return get(
      ExternalGet({
        url: 'https://github.com/commons-stack/praise-exports/blob/2fcd222cd2903b432df951b4e10341ba0462e593/aragon.json',
      })
    );
  },
});
