import { isValidUsername } from '../../users/utils/is-valid-username';
import { MigrationsContext } from '../interfaces/migration-context.interface';
import { UserModel } from '../schemas/user/30_user.schema';

const up = async ({ context }: MigrationsContext): Promise<void> => {
  const users = await UserModel.find({});

  if (users.length === 0) return;

  const updates = await Promise.all(
    users.map(async (user: any) => {
      return {
        updateOne: {
          filter: { _id: user._id },
          update: {
            $set: {
              username: isValidUsername(user.username)
                ? user.username
                : await context.usersService.generateValidUsername(
                    user.username,
                  ),
            },
          },
        },
      };
    }) as any,
  );

  await UserModel.bulkWrite(updates);
};

export { up };
