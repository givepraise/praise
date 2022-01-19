import UserModel, { UserRole } from '@entities/User';

const seedAdmins = () => {
  const admins = process.env.ADMINS as string;
  const ethAddresses = admins.split(',').join('').split('');

  ethAddresses.forEach(async (e) => {
    const user = await UserModel.findOne({ ethereumAddress: e });

    if (user) {
      if (!user.roles.includes(UserRole.QUANTIFIER)) {
        user.roles.push(UserRole.QUANTIFIER);
        user.save();
      }
    } else {
      await UserModel.create({
        ethereumAddress: e,
        roles: [UserRole.QUANTIFIER],
      });
    }
  });
};

export default seedAdmins;
