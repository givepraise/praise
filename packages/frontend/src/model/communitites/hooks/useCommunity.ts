import { useRecoilValue } from 'recoil';
import { Community } from '../dto/community.dto';
import { CommunityByHostname } from '../communities';

type useCommunityReturn = {
  community: Community | undefined;
};

export function useCommunity(): useCommunityReturn {
  const community = useRecoilValue(
    CommunityByHostname(window.location.hostname)
  );

  return { community };
}
