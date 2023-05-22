import { User } from 'discord.js';
import {
  CreateUserAccountInputDto,
  CreateUserAccountResponseDto,
  UpdateUserAccountInputDto,
  UpdateUserAccountResponseDto,
  UserAccount,
} from './api-schema';
import { apiGet, apiPatch, apiPost } from './api';

const createUserAccount = async (
  user: User,
  host: string
): Promise<UserAccount> => {
  const newUserAccount: CreateUserAccountInputDto = {
    accountId: user.id,
    name: user.username + '#' + user.discriminator,
    platform: 'DISCORD',
  };
  if (user.avatar) newUserAccount.avatarId = user.avatar;
  const response = await apiPost<CreateUserAccountResponseDto, CreateUserAccountInputDto>('/useraccounts', newUserAccount, {
    headers: { host: host },
  });
  return response.data;
};

const updateUserAccount = async (
  ua: UserAccount,
  user: User,
  host: string
): Promise<UserAccount> => {
  if (
    ua.name !== user.username + '#' + user.discriminator ||
    ua.avatarId !== user.avatar
  ) {
    const updatedUserAccount: UpdateUserAccountInputDto = {
      name: user.username + '#' + user.discriminator,
    };
    if (user.avatar) updatedUserAccount.avatarId = user.avatar;
    const response = await apiPatch<UpdateUserAccountResponseDto, UpdateUserAccountInputDto>(
      `/useraccounts/${ua._id}`,
      updatedUserAccount,
      {
        headers: { host: host },
      }
    );
    return response.data;
  }
  return ua;
};

/**
 * Fetch UserAccount associated with Discord user from api
 *
 * @param {GuildMember} member
 * @returns {Promise<UserAccount>}
 */
export const getUserAccount = async (
  user: User,
  host: string
): Promise<UserAccount> => {
  const data = await apiGet<UserAccount[]>(`/useraccounts/?accountId=${user.id}`, {
      headers: { host: host },
    })
    .then((res) => res.data.filter((acc) => acc.platform === 'DISCORD'))
    .catch(() => undefined);

  try {
    if (!data || !data.length) {
      return await createUserAccount(user, host);
    } else {
      return await updateUserAccount(data[0], user, host);
    }
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.log((e as any).data);
    throw e;
  }
};
