import { Injectable } from '@nestjs/common';
import { CommunityService } from '../../community/community.service';
import { Community } from '../../community/schemas/community.schema';

@Injectable()
export class CommunitiesSeeder {
  constructor(private readonly communityService: CommunityService,
) {}

  /**
   * Generate and save a fake User
   *
   * @param {Object} [Community={}]
   * @returns {Promise<Community>}
   */
  seedCommunity = async (communityData?: unknown): Promise<Community> => {
    const community = await this.communityService.getModel().create({
      isPublic: true,
      ...(communityData as any),
    });

    return community;
  };
}
