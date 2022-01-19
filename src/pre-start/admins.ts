import UserModel, { UserRole } from '@entities/User';

const seedAdmins = () => {
  const admins = process.env.ADMINS as string;
  const ethAddresses = admins
    .split(',')
    .filter(Boolean)
    .map((item) => {
      return item.trim();
    });

  ethAddresses.forEach(async (e) => {
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

export default seedAdmins;
