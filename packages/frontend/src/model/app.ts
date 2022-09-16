import { TransformerMap } from 'api/dist/period/types';
import { AxiosResponse } from 'axios';
import { atom, atomFamily, selector, useRecoilValue } from 'recoil';
import { recoilPersist } from 'recoil-persist';
import { ApiAuthGet, isResponseOk } from './api';
import { ExternalGet } from './axios';

const { persistAtom } = recoilPersist();

export interface GithubResponse {
  name: string;
}

export const GithubVersionQuery = selector({
  key: 'GithubVersionQuery',
  get: ({ get }): AxiosResponse<GithubResponse> => {
    const repoOwner = 'commons-stack';
    const repoName = 'praise';

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
    current: '0.11.2', //TODO: get this from package.json
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

export const CustomExportTransformer = atom<TransformerMap | undefined>({
  key: 'CustomExportTransformer',
  default: undefined,
  effects: [
    ({ setSelf, getPromise }): void => {
      setSelf(
        getPromise(
          ApiAuthGet({
            url: 'admin/settings/customTransformer',
          })
        ).then((response) => {
          if (isResponseOk(response)) {
            const transformer = response.data as TransformerMap;
            return transformer;
          }
        })
      );
    },
  ],
});
