import axios, { AxiosInstance } from 'axios';
import { useGithubVersionQuery } from '@/model/app';
import { handleErrors } from './api';

/**
 * Client for external requests.
 * @returns
 */
export const makeClient = (): AxiosInstance => {
  const client = axios.create();

  client.interceptors.response.use(
    (res) => res,
    (err) => {
      return handleErrors(err);
    }
  );
  return client;
};

interface PraiseAppVersion {
  current: string | undefined;
  latest: string;
  newVersionAvailable: boolean;
}

export const usePraiseAppVersion = (): PraiseAppVersion => {
  const githubVersion = useGithubVersionQuery().substring(1);
  const currentVersion = process.env.REACT_APP_VERSION;
  const isNewVersion = githubVersion === currentVersion;

  return {
    current: currentVersion,
    latest: githubVersion,
    newVersionAvailable: isNewVersion,
  };
};
