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
import { UtilsProvider } from '@/utils/utils.provider';
import { PraiseAllInput } from './intefaces/praise-all-input.inteface';
import { PraiseExportInput } from './intefaces/praise-export-input.interface';

@Injectable()
export class PraiseService {
  constructor(
    @InjectModel(Praise.name)
    private praiseModel: typeof PaginatedPraiseModel,
    private utils: UtilsProvider,
  ) {}

  async findAll(
    req: Request,
  ): Promise<PaginatedResponseBody<PraiseDetailsDto>> {
    const query = this.getPraiseAllInput(req.query);
    const queryInput = this.utils.getQueryInput(req.query);

    const praisePagination = await this.praiseModel.paginate({
      query,
      ...queryInput,
      sort: this.utils.getQuerySort(req.query),
      populate: [
        {
          path: 'giver',
          populate: { path: 'user', select: 'username' },
        },
        {
          path: 'receiver',
          populate: { path: 'user', select: 'username' },
        },
        {
          path: 'forwarder',
          populate: { path: 'user', select: 'username' },
        },
      ],
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

  getPraiseAllInput = (q: PraiseAllInput): PraiseAllInput => {
    const { receiver, giver } = q;
    const query: PraiseExportInput = {};

    if (receiver) {
      query.receiver = encodeURIComponent(receiver);
    }

    if (giver) {
      query.giver = encodeURIComponent(giver);
    }

    return query;
  };
}
