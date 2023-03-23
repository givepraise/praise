import { ServiceException } from '@/shared/exceptions/service-exception';
import { errorMessages } from '@/utils/errorMessages';

/**
 * - owners should contain creator
 */
export function assertOwnersIncludeCreator(owners: string[], creator: string) {
  if (!owners.includes(creator)) {
    throw new ServiceException(
      errorMessages.INVALID_OWNERS_CREATOR_MUST_BE_INCLUDED_IN_THE_OWNERS,
    );
  }
  return true;
}
