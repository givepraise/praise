import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { PraiseModel, Praise, PraiseDocument } from './schemas/praise.schema';
import { ServiceException } from '../shared/service-exception';
import { QuantifyPraiseProps } from './intefaces/quantify-praise.interface';
import { PeriodStatusType } from '@/periods/enums/status-type.enum';
import { Period } from '@/periods/schemas/periods.schema';
import { SettingsService } from '@/settings/settings.service';
import { QuantificationsService } from '@/quantifications/quantifications.service';
import { FindAllPraisePaginatedQuery } from './dto/find-all-praise-paginated-query.dto';
import { PaginationModel } from '@/shared/dto/pagination-model.dto';
import { Pagination } from 'mongoose-paginate-ts';
import { EventLogService } from '../event-log/event-log.service';
import { EventLogTypeKey } from '@/event-log/enums/event-log-type-key';
import { RequestContext } from 'nestjs-request-context';
import { RequestWithUser } from '@/auth/interfaces/request-with-user.interface';
import { PeriodsService } from '@/periods/periods.service';

@Injectable()
export class PraiseService {
  constructor(
    @InjectModel(Praise.name)
    private praiseModel: typeof PraiseModel,
    private periodService: PeriodsService,
    private settingsService: SettingsService,
    private quantificationsService: QuantificationsService,
    private eventLogService: EventLogService,
  ) {}

  /**
   * Convenience method to get the Praise Model
   * @returns
   */
  getModel(): Pagination<PraiseDocument> {
    return this.praiseModel;
  }

  /**
   * Find all praise paginated
   *
   * @param options
   * @returns {Promise<PaginationModel<Praise>>}
   * @throws {ServiceException}
   */
  async findAllPaginated(
    options: FindAllPraisePaginatedQuery,
  ): Promise<PaginationModel<Praise>> {
    const { sortColumn, sortType } = options;
    const query = {} as any;

    if (options.receiver) {
      query.receiver = new Types.ObjectId(options.receiver);
    }

    if (options.giver) {
      query.giver = new Types.ObjectId(options.giver);
    }

    const praisePagination = await this.praiseModel.paginate({
      ...options,
      query,
      sort: sortColumn && sortType ? { [sortColumn]: sortType } : undefined,
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

    const docs = praisePagination.docs.map((praise) => new Praise(praise));

    return {
      ...praisePagination,
      docs,
    };
  }

  /**
   * Find one praise by id
   * @param _id
   * @returns {Promise<Praise>}
   * @throws {ServiceException}
   *
   **/
  async findOneById(_id: Types.ObjectId): Promise<Praise> {
    const praise = await this.praiseModel
      .findById(_id)
      .populate('giver receiver forwarder quantifications')
      .lean();

    if (!praise) throw new ServiceException('Praise item not found.');

    return praise;
  }

  /**
   * Quantify praise item
   *
   * @param id {string}
   * @param bodyParams {CreateUpdateQuantificationRequest}
   * @returns {Promise<Praise[]>}
   * @throws {ServiceException}
   *
   **/
  quantifyPraise = async ({
    id,
    bodyParams,
  }: QuantifyPraiseProps): Promise<Praise[]> => {
    const req: RequestWithUser = RequestContext.currentContext.req;
    const { score, dismissed, duplicatePraise } = bodyParams;

    const praise = await this.praiseModel
      .findById(id)
      .populate('giver receiver forwarder')
      .lean();

    if (!praise) throw new ServiceException('Praise');

    const period = await this.periodService.getPraisePeriod(praise);
    if (!period)
      throw new ServiceException('Praise does not have an associated period');

    if (period.status !== PeriodStatusType.QUANTIFY)
      throw new ServiceException(
        'Period associated with praise does have status QUANTIFY',
      );

    const settingAllowedScores = (await this.settingsService.settingValue(
      'PRAISE_QUANTIFY_ALLOWED_VALUES',
      period._id,
    )) as string;

    const allowedScore = settingAllowedScores.split(',').map(Number);

    if (!allowedScore.includes(score)) {
      throw new ServiceException(
        `Score ${score} is not allowed. Allowed scores are: ${allowedScore.join(
          ', ',
        )}`,
      );
    }

    const quantification =
      await this.quantificationsService.findOneByQuantifierAndPraise(
        req.user._id,
        praise._id,
      );

    if (!quantification)
      throw new ServiceException('User not assigned as quantifier for praise.');

    let eventLogMessage = '';

    // Collect all affected praises (i.e. any praises whose scoreRealized will change as a result of this change)
    const affectedPraises: Praise[] = [praise];

    const praisesDuplicateOfThis = await this.findDuplicatePraiseItems(
      praise._id,
      req.user._id,
    );

    if (praisesDuplicateOfThis?.length > 0)
      affectedPraises.push(...praisesDuplicateOfThis);

    // Modify praise quantification values
    if (duplicatePraise) {
      if (duplicatePraise === praise._id.toString())
        throw new ServiceException('Praise cannot be a duplicate of itself');

      const dp = await this.praiseModel.findById(duplicatePraise).lean();
      if (!dp) throw new ServiceException('Duplicate praise item not found');

      if (praisesDuplicateOfThis?.length > 0)
        throw new ServiceException(
          'Praise cannot be marked duplicate when it is the original of another duplicate',
        );

      const praisesDuplicateOfAnotherDuplicate =
        await this.findPraisesDuplicateOfAnotherDuplicate(
          new Types.ObjectId(duplicatePraise),
          req.user._id,
        );

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

    await this.eventLogService.logEvent({
      typeKey: EventLogTypeKey.PERMISSION,
      description: eventLogMessage,
      periodId: period._id,
    });

    const docs = affectedPraises.map((p) => new Praise(p));
    return docs;
  };

  /**
   * Find all praises that are duplicates of the given praise
   * @param {Types.ObjectId} praiseId
   * @param {Types.ObjectId} quantifierId
   * @returns {Promise<Praise[]>}
   *
   */
  findDuplicatePraiseItems = async (
    praiseId: Types.ObjectId,
    quantifierId: Types.ObjectId,
  ): Promise<Praise[]> => {
    const duplicateQuantifications =
      await this.quantificationsService.findByQuantifierAndDuplicatePraise(
        quantifierId,
        praiseId,
      );

    const duplicatePraiseItems = await this.praiseModel
      .find({
        _id: { $in: duplicateQuantifications.map((q) => q.praise) },
      })
      .populate('giver receiver forwarder')
      .lean();

    return duplicatePraiseItems;
  };

  /**
   * Find all praises that are duplicates of the given duplicate praise
   * @param {Types.ObjectId} duplicatePraiseId
   * @param {Types.ObjectId} quantifierId
   * @returns {Promise<Praise[]>}
   *
   **/
  findPraisesDuplicateOfAnotherDuplicate = async (
    duplicatePraiseId: Types.ObjectId,
    quantifierId: Types.ObjectId,
  ): Promise<Praise[]> => {
    const duplicateQuantifications =
      await this.quantificationsService.findByQuantifierAndDuplicatePraiseExist(
        quantifierId,
        true,
      );

    const duplicatePraiseItems = await this.praiseModel.find({
      _id: {
        $in: duplicateQuantifications.map(
          (q) => q.praise._id === duplicatePraiseId,
        ),
      },
    });

    return duplicatePraiseItems;
  };
}
