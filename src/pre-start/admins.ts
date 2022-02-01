import { UserModel } from '@user/entities';
import { UserRole } from '@user/types';

const seedAdmins = (): void => {
  const admins = process.env.ADMINS as string;
  const ethAddresses = admins
    .split(',')
    .filter(Boolean)
    .map((item) => {
      return item.trim();
    });

  ethAddresses.forEach(async (e): Promise<void> => {
    const user = await UserModel.findOne({ ethereumAddress: e });

    if (user) {
      if (!user.roles.includes(UserRole.ADMIN)) {
        user.roles.push(UserRole.ADMIN);
        user.save();
      }
      if (!user.roles.includes(UserRole.USER)) {
        user.roles.push(UserRole.USER);
        user.save();
      }
    } else {
      await UserModel.create({
        ethereumAddress: e,
        roles: [UserRole.ADMIN, UserRole.USER],
      });
    }
  });
};

export { seedAdmins };
