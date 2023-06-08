import { logger } from 'ethers';
import { MigrationsContext } from '../interfaces/migration-context.interface';
import { UserModel } from '../schemas/user/30_user.schema';
import { Document, Types } from 'mongoose';

/**
 * User type interface for our user objects to enhance clarity and readability.
 */
interface User extends Document {
  _id: Types.ObjectId;
  username: string;
  identityEthAddress: string;
  accounts: {
    name: string;
  }[];
}

/**
 * Function to update usernames.
 * The function checks if the username is identical to identityEthAddress and
 * if there is an account attached to the user.
 * In case both conditions are met, the username is updated with the name of the account.
 * If the name of the account contains a '#', the function will take only the part of
 * the string before the '#'.
 * The updated usernames are then checked for validity and formatted accordingly.
 * Bulk update operation is done using MongoDB's bulkWrite function for better performance.
 *
 * @param {MigrationsContext} { context } - The migration context which provides necessary services and models.
 * @returns {Promise<void>} - Returns a promise that resolves when the operation is finished.
 */
const up = async ({ context }: MigrationsContext): Promise<void> => {
  // Find all users and populate the 'accounts' field
  const users: User[] = await UserModel.find({}).populate('accounts');

  // If no users are found, return
  if (users.length === 0) return;

  // Map through each user and prepare updates
  const updates = await Promise.all(
    users.map(async (user: User) => {
      let username = user.username;

      // Check if username is the same as identityEthAddress and if user has accounts
      if (
        user.username === user.identityEthAddress &&
        Array.isArray(user.accounts) &&
        user.accounts.length > 0
      ) {
        let accountName = user.accounts[0].name;

        // If accountName contains '#', split and take only first part
        // This is the case for Discord usernames
        accountName = accountName.includes('#')
          ? accountName.split('#')[0]
          : accountName;

        // Generate a valid username from the accountName
        username = await context.usersService.generateValidUsername(
          accountName,
        );

        logger.info(`Setting username for ${user.username} to "${username}"`);
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
