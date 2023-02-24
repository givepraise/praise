import axios from 'axios';
import { selectorFamily } from 'recoil';
import { AccessToken } from '../../auth/auth';
import { apiBaseURL } from '@/utils/api';

export const ParquetQuery = selectorFamily({
  key: 'ParquetQuery',
  get:
    (url: string | undefined) =>
    async ({ get }): Promise<Uint8Array | undefined> => {
      if (!url) return undefined;
      const accessToken = get(AccessToken);
      try {
        const response = await axios.get<ArrayBuffer>(`${apiBaseURL}/${url}`, {
          responseType: 'arraybuffer',
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (response.status !== 200 || response.data.byteLength === 0) {
          return undefined;
        }
        return new Uint8Array(response.data);
      } catch (error) {
        return undefined;
      }
    },
});
