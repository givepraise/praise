import { UserModel } from '@user/entities';
import { UserRole } from 'shared/dist/user/types';

const seedAdmins = async (): Promise<void> => {
  const admins = process.env.ADMINS as string;
  const ethAddresses = admins
    .split(',')
    .filter(Boolean)
    .map((item) => {
      return item.trim();
    });

  for (const e of ethAddresses) {
    const user = await UserModel.findOne({ ethereumAddress: e });

    if (user) {
      if (!user.roles.includes(UserRole.ADMIN)) {
        user.roles.push(UserRole.ADMIN);
        await user.save();
      }
      if (!user.roles.includes(UserRole.USER)) {
        user.roles.push(UserRole.USER);
        await user.save();
      }
    } else {
      await UserModel.create({
        ethereumAddress: e,
        roles: [UserRole.ADMIN, UserRole.USER],
      });
    }
  }
};

export { seedAdmins };
