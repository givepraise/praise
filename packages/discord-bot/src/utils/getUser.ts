import { apiGet } from './api';
import { User } from './api-schema';

/**
 * Fetch User by id
 *
 */
export const getUser = async (
  id: string,
  host: string
): Promise<User | undefined> => {
  return await apiGet<User>(`/users/${id}`, {
      headers: { host },
    })
    .then((res) => res.data)
    .catch(() => undefined);
};
