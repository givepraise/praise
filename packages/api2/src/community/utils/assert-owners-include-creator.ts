import { ServiceException } from '@/shared/exceptions/service-exception';

/**
 * - owners should contain creator
 */
export function assertOwnersIncludeCreator(owners: string[], creator: string) {
  if (!owners.includes(creator)) {
    throw new ServiceException(
      'Invalid owners, creator must be included in the owners.',
    );
  }
  return true;
}
