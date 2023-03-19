import { ethers } from 'ethers';

/**
 * A valid name is:
 * - minimum 1 iterm
 * - all items are valid ethereum addresses
 */
export function isValidOwners(owners: string[]) {
  owners.forEach((owner) => {
    if (!ethers.utils.isAddress(owner)) {
      throw new Error(
        'Invalid owner, all owners must be valid ethereum addresses.',
      );
    }
  });
  if (new Set(owners).size !== owners.length) {
    throw new Error('Invalid owner, owners must be unique.');
  }
  return true;
}
