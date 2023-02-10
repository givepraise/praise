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
            $unset: {
              accessToken: 1,
              refreshToken: 1,
            },
          },
          upsert: true,
        },
      };
    }) as any,
  );

  await UserModel.bulkWrite(updates);
};

export { up };
