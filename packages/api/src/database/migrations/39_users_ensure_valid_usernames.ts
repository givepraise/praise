import { logger } from 'ethers';
import { isValidUsername } from '../../users/utils/is-valid-username';
import { MigrationsContext } from '../interfaces/migration-context.interface';
import { UserModel } from '../schemas/user/30_user.schema';
import { Document, Types } from 'mongoose';

// Here, we create a type for our user objects to enhance clarity and readability.
interface User extends Document {
  _id: Types.ObjectId;
  username: string;
}

/**
 * Function to update usernames that aren't valid.
 * It goes through each user in the UserModel and checks if the username is valid.
 * If not, it generates a valid username using the usersService's generateValidUsername function.
 * The updates are done using MongoDB's bulkWrite operation for better performance.
 *
 * @param {MigrationsContext} { context } - The migration context which provides necessary services and models.
 *
 * @returns {Promise<void>} - Returns a promise that resolves when the operation is finished.
 */
const up = async ({ context }: MigrationsContext): Promise<void> => {
  // Find all users
  const users: User[] = await UserModel.find({});

  // If no users are found, return
  if (users.length === 0) return;

  // Map through each user and prepare updates
  const updates = await Promise.all(
    users.map(async (user: User) => {
      // If the username is valid, no need for change. If not, generate a valid username.
      let username = user.username;
      if (!isValidUsername(username)) {
        username = await context.usersService.generateValidUsername(
          user.username,
        );
        logger.info(
          `Invalid username: "${user.username}" was changed to "${username}"`,
        );
      }

      // Return the updateOne operation object for MongoDB's bulkWrite
      return {
        updateOne: {
          filter: { _id: user._id },
          update: {
            $set: {
              username,
            },
          },
        },
      };
    }),
  );

  // Perform the updates in bulk
  await UserModel.bulkWrite(updates);
};

// Export the function
export { up };
