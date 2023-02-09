import axios from 'axios';
import { atomFamily } from 'recoil';
import { AccessToken } from '../../auth/auth';
import { apiBaseURL } from '@/utils/api';

const loadParquet =
  (url: string | undefined) =>
  ({ setSelf, trigger, getPromise }): void => {
    const load = async (): Promise<void> => {
      const accessToken = await getPromise(AccessToken);
      try {
        const response = await axios.get<ArrayBuffer>(`${apiBaseURL}/${url}`, {
          responseType: 'arraybuffer',
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (response.status !== 200 || response.data.byteLength === 0) {
          setSelf(undefined);
          return;
        }
        setSelf(response.data);
      } catch (error) {
        setSelf(undefined);
      }
    };
    if (trigger === 'get' && url) {
      void load();
    }
  };

export const Parquet = atomFamily<ArrayBuffer | undefined, string | undefined>({
  key: 'DuckDb',
  default: undefined,
  effects: (url) => [loadParquet(url)],
});
