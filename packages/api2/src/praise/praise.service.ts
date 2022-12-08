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
import { QuantifyPraiseProps } from './intefaces/quantify-praise.interface';
import { PeriodStatusType } from '@/periods/enums/status-type.enum';
import { Period } from '@/periods/schemas/periods.schema';
import { SettingsService } from '@/settings/settings.service';

@Injectable()
export class PraiseService {
  constructor(
    @InjectModel(Praise.name)
    private praiseModel: typeof PaginatedPraiseModel,
    @InjectModel(Period.name)
    private periodModel: Model<Period>,
    private settingsService: SettingsService,
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

  quantifyPraise = async ({
    id,
    bodyParams,
    currentUser,
  }: QuantifyPraiseProps): Promise<Praise[]> => {
    const { score, dismissed, duplicatePraise } = bodyParams;

    const praise = await this.praiseModel
      .findById(id)
      .populate('giver receiver forwarder');
    if (!praise) throw new ServiceException('Praise');

    const period = await this.getPraisePeriod(praise);
    if (!period)
      throw new ServiceException('Praise does not have an associated period');

    if (period.status !== PeriodStatusType.QUANTIFY)
      throw new ServiceException(
        'Period associated with praise does have status QUANTIFY',
      );

    const allowedScore = (await this.settingsService.settingValue(
      'PRAISE_QUANTIFY_ALLOWED_VALUES',
      period._id,
    )) as number[];

    if (!allowedScore.includes(score)) {
      throw new ServiceException(
        `Score ${score} is not allowed. Allowed scores are: ${allowedScore.join(
          ', ',
        )}`,
      );
    }

    const quantification = praise.quantifications.find((q) =>
      q.quantifier._id.equals(currentUser._id),
    );

    if (!quantification)
      throw new ServiceException('User not assigned as quantifier for praise.');

    let eventLogMessage = '';

    // Collect all affected praises (i.e. any praises whose scoreRealized will change as a result of this change)
    const affectedPraises: PraiseDocument[] = [praise];

    const praisesDuplicateOfThis = await this.praiseModel
      .find({
        quantifications: {
          $elemMatch: {
            quantifier: currentUser._id,
            duplicatePraise: praise._id,
          },
        },
      })
      .populate('giver receiver forwarder');

    if (praisesDuplicateOfThis?.length > 0)
      affectedPraises.push(...praisesDuplicateOfThis);

    // Modify praise quantification values
    if (duplicatePraise) {
      if (duplicatePraise === praise._id.toString())
        throw new ServiceException('Praise cannot be a duplicate of itself');

      const dp = await this.praiseModel.findById(duplicatePraise);
      if (!dp) throw new ServiceException('Duplicate praise item not found');

      if (praisesDuplicateOfThis?.length > 0)
        throw new ServiceException(
          'Praise cannot be marked duplicate when it is the original of another duplicate',
        );

      const praisesDuplicateOfAnotherDuplicate = await this.praiseModel.find({
        _id: duplicatePraise,
        quantifications: {
          $elemMatch: {
            quantifier: currentUser._id,
            duplicatePraise: { $exists: 1 },
          },
        },
      });

      if (praisesDuplicateOfAnotherDuplicate?.length > 0)
        throw new ServiceException(
          'Praise cannot be marked duplicate of another duplicate',
        );

      quantification.score = 0;
      quantification.dismissed = false;
      quantification.duplicatePraise = dp;

      eventLogMessage = `Marked the praise with id "${(
        praise._id as Types.ObjectId
      ).toString()}" as duplicate of the praise with id "${(
        dp._id as Types.ObjectId
      ).toString()}"`;
    } else if (dismissed) {
      quantification.score = 0;
      quantification.dismissed = true;
      quantification.duplicatePraise = undefined;

      eventLogMessage = `Dismissed the praise with id "${(
        praise._id as Types.ObjectId
      ).toString()}"`;
    } else {
      quantification.score = score;
      quantification.dismissed = false;
      quantification.duplicatePraise = undefined;

      eventLogMessage = `Gave a score of ${
        quantification.score
      } to the praise with id "${(praise._id as Types.ObjectId).toString()}"`;
    }

    await praise.save();

    // await logEvent(
    //   EventLogTypeKey.QUANTIFICATION,
    //   eventLogMessage,
    //   {
    //     userId: currentUser._id,
    //   },
    //   period._id,
    // );

    return affectedPraises;
  };

  /**
   * Fetch the period associated with a praise instance,
   *  (as they are currently not related in database)
   *
   * Determines the associated period by:
   *  finding the period with the lowest endDate, that is greater than the praise.createdAt date
   *
   * @param {Praise} praise
   * @returns {(Promise<PeriodDocument | undefined>)}
   */
  getPraisePeriod = async (praise: Praise): Promise<Period | undefined> => {
    const period = await this.periodModel
      .find(
        // only periods ending after praise created
        {
          endDate: { $gte: praise.createdAt },
        },
        null,
        // sort periods by ending date ascending
        {
          sort: { endDate: 1 },
        },

        // select the period with the earliest ending date
      )
      .limit(1);

    if (!period || period.length === 0) return undefined;

    return period[0];
  };
}
