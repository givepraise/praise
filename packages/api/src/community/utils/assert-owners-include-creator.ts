import { ApiException } from '../../shared/exceptions/api-exception';
import { errorMessages } from '../../shared/exceptions/error-messages';

/**
 * - owners should contain creator
 */
export function assertOwnersIncludeCreator(owners: string[], creator: string) {
  if (!owners.includes(creator)) {
    throw new ApiException(
      errorMessages.INVALID_OWNERS_CREATOR_MUST_BE_INCLUDED_IN_THE_OWNERS,
    );
  }
  return true;
}
