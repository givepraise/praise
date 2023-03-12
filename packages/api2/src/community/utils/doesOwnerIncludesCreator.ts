/**
 * - owners should contain creator
 */
export function doesOwnerIncludesCreator(owners: string[], creator: string) {
  if (!owners.includes(creator)) {
    console.log('doesOwnerIncludesCreator', owners, creator)
    throw new Error('Invalid owner, creator must be included in the owners.');
  }
  return true
}
