import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ServiceException } from '@/shared/exceptions/service-exception';
import { User } from '@/users/schemas/users.schema';
import { Community, CommunityModel } from './schemas/community.schema';
import { PaginatedQueryDto } from '@/shared/dto/pagination-query.dto';
import { CommunityPaginatedResponseDto } from './dto/community-pagination-model.dto';
import { UpdateCommunityInputDto } from './dto/update-community-input.dto';
import { UpdateCommunityBySuperAdminInputDto } from './dto/update-community-by-superAdmin-input.dto';
import { CreateCommunityInputDto } from './dto/create-community-input.dto';

@Injectable()
export class CommunityService {
  constructor(
    @InjectModel(Community.name)
    private communityModel: typeof CommunityModel,
  ) {}

  /**
   * Convenience method to get the EventLog Model
   * @returns
   */
  getModel(): typeof CommunityModel {
    return this.communityModel;
  }

  async findOne(query: any): Promise<Community> {
    return  this.communityModel
      .findOne(query)
      .lean();
  }

  async findOneById(_id: Types.ObjectId): Promise<Community> {
    return this.findOne({ _id });
  }

  /**
   * Find all event logs. Paginated.
   * @param options
   * @returns
   */
  async findAllPaginated(
    options: PaginatedQueryDto,
  ): Promise<CommunityPaginatedResponseDto> {
    const { page, limit, sortColumn, sortType } = options;
    const query = {} as any;

    // Sorting - defaults to descending
    const sort =
      sortColumn && sortType ? { [sortColumn]: sortType } : undefined;

    const paginateQuery = {
      query,
      limit,
      page,
      sort
    };

    const communityPagination = await this.communityModel.paginate(paginateQuery);
    if (!communityPagination)
      throw new ServiceException('Failed to query event logs');

    return communityPagination;
  }

  async updateByCommunityAdmin(_id: Types.ObjectId, community: UpdateCommunityInputDto): Promise<Community> {
    // TODO check if admin has access to community
    const communityDocument = await this.communityModel.findById(_id);
    if (!communityDocument) throw new ServiceException('Community not found.');

    for (const [k, v] of Object.entries(community)) {
      communityDocument.set(k, v);
    }

    await communityDocument.save();
    return this.findOneById(communityDocument._id);
  }
  async updateBySuperAdmin(_id: Types.ObjectId, community: UpdateCommunityBySuperAdminInputDto): Promise<Community> {
    const communityDocument = await this.communityModel.findById(_id);
    if (!communityDocument) throw new ServiceException('Community not found.');

    for (const [k, v] of Object.entries(community)) {
      communityDocument.set(k, v);
    }

    await communityDocument.save();
    return this.findOneById(communityDocument._id);
  }

  async create(communityDto: CreateCommunityInputDto): Promise<User> {
    const createdUser = new this.communityModel(communityDto);
    await createdUser.save();
    return createdUser.toObject();
  }

}
