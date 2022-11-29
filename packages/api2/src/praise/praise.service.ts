import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import {
  PaginatedPraiseModel,
  Praise,
  PraiseDocument,
} from './schemas/praise.schema';
import { ServiceException } from '../shared/service-exception';
import { Request } from 'express';
import { PaginatedResponseBody } from '@/shared/types.shared';
import { PraiseDetailsDto } from './dto/praise-details.dto';

@Injectable()
export class PraiseService {
  constructor(
    @InjectModel(Praise.name)
    private praiseModel: typeof PaginatedPraiseModel,
  ) {}

  async findAll(
    req: Request,
  ): Promise<PaginatedResponseBody<PraiseDetailsDto>> {
    /** TODO: pagination */
    const praisePagination = await this.praiseModel.paginate({
      populate: 'giver receiver forwarder',
    });

    if (!praisePagination)
      throw new ServiceException('Failed to paginate praise data');

    const docs = praisePagination.docs.map(
      (praise) => new Praise(praise),
    ) as PraiseDetailsDto[];

    return {
      ...praisePagination,
      docs,
    };
  }

  async findOneById(_id: Types.ObjectId): Promise<Praise> {
    const praise = await this.praiseModel
      .findById(_id)
      .populate('giver receiver forwarder')
      .lean();

    if (!praise) throw new ServiceException('Praise item not found.');
    return praise;
  }
}
