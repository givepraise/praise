import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { PraiseModel, Praise, PraiseDocument } from './schemas/praise.schema';
import { ServiceException } from '../shared/service-exception';
import { PeriodStatusType } from '@/periods/enums/status-type.enum';
import { SettingsService } from '@/settings/settings.service';
import { QuantificationsService } from '@/quantifications/quantifications.service';
import { PraisePaginatedQueryDto } from './dto/praise-paginated-query.dto';
import { Pagination } from 'mongoose-paginate-ts';
import { EventLogService } from '../event-log/event-log.service';
import { EventLogTypeKey } from '@/event-log/enums/event-log-type-key';
import { PeriodsService } from '@/periods/periods.service';
import { QuantifyInputDto } from '@/praise/dto/quantify-input.dto';
import { RequestContext } from 'nestjs-request-context';
import { RequestWithAuthContext } from '@/auth/interfaces/request-with-auth-context.interface';
import { PraisePaginatedResponseDto } from './dto/praise-paginated-response.dto';

@Injectable()
export class PraiseService {
  constructor(
    @InjectModel(Praise.name)
    private praiseModel: typeof PraiseModel,
    @Inject(forwardRef(() => PeriodsService))
    private periodService: PeriodsService,
    @Inject(forwardRef(() => SettingsService))
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
    options: PraisePaginatedQueryDto,
  ): Promise<PraisePaginatedResponseDto> {
    const { sortColumn, sortType, receiver, giver, page, limit } = options;
    const query = {} as any;

    if (receiver) {
      query.receiver = receiver;
    }

    if (giver) {
      query.giver = giver;
    }

    const praisePagination = await this.praiseModel.paginate({
      page,
      limit,
      query,
      sort: sortColumn && sortType ? { [sortColumn]: sortType } : undefined,
      populate: [
        {
          path: 'giver',
          populate: { path: 'user' },
        },
        {
          path: 'receiver',
          populate: { path: 'user' },
        },
        {
          path: 'forwarder',
          populate: { path: 'user' },
        },
      ],
    });

    if (!praisePagination)
      throw new ServiceException('Failed to paginate praise data');

    return praisePagination;
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
      .populate([
        {
          path: 'giver',
          populate: { path: 'user' },
        },
        {
          path: 'receiver',
          populate: { path: 'user' },
        },
        {
          path: 'forwarder',
          populate: { path: 'user' },
        },
        'quantifications',
      ])
      .lean();

    if (!praise) throw new ServiceException('Praise item not found.');

    return praise;
  }

  /**
   * Quantify praise item
   *
   * @param id {string}
   * @param bodyParams {QuantifyInputDto}
   * @returns An array of all affected praise items
   * @throws {ServiceException}
   *
   **/
  quantifyPraise = async (
    id: Types.ObjectId,
    params: QuantifyInputDto,
  ): Promise<Praise[]> => {
    const { score, dismissed, duplicatePraiseId } = params;

    // Get the praise item in question
    const praise = await this.praiseModel
      .findById(id)
      .populate('giver receiver forwarder')
      .lean();
    if (!praise) throw new ServiceException('Praise item not found');

    // Get the period associated with the praise item
    const period = await this.periodService.getPraisePeriod(praise);
    if (!period)
      throw new ServiceException('Praise does not have an associated period');

    // Check if the period is in the QUANTIFY status
    if (period.status !== PeriodStatusType.QUANTIFY)
      throw new ServiceException(
        'Period associated with praise does have status QUANTIFY',
      );

    // Check that user is assigned as quantifier for the praise item
    const req: RequestWithAuthContext = RequestContext.currentContext.req;
    const userId = req.user?.userId;
    if (!userId)
      throw new ServiceException('User not found in request context');

    const quantification =
      await this.quantificationsService.findOneByQuantifierAndPraise(
        userId,
        praise._id,
      );
    if (!quantification) {
      throw new ServiceException('User not assigned as quantifier for praise.');
    }

    let eventLogMessage = '';

    // Collect all affected praises (i.e. any praises whose score will change as a result of this change)
    const affectedPraises: Praise[] = [praise];
    const praisesDuplicateOfThis = await this.findDuplicatePraiseItems(
      praise._id,
      userId,
    );
    if (praisesDuplicateOfThis?.length > 0)
      affectedPraises.push(...praisesDuplicateOfThis);

    if (duplicatePraiseId) {
      // Check that the duplicatePraise is not the same as the praise item
      if (praise._id.equals(duplicatePraiseId))
        throw new ServiceException('Praise cannot be a duplicate of itself');

      // Find the original praise item
      const dp = await this.praiseModel.findById(duplicatePraiseId).lean();
      if (!dp) throw new ServiceException('Duplicate praise item not found');

      // Check that this praise item is not already the original of another duplicate
      if (praisesDuplicateOfThis?.length > 0)
        throw new ServiceException(
          'Praise cannot be marked duplicate when it is the original of another duplicate',
        );

      // Check that this praise item does not become the duplicate of another duplicate
      const praisesDuplicateOfAnotherDuplicate =
        await this.findPraisesDuplicateOfAnotherDuplicate(
          new Types.ObjectId(duplicatePraiseId),
          userId,
        );

      if (praisesDuplicateOfAnotherDuplicate?.length > 0)
        throw new ServiceException(
          'Praise cannot be marked duplicate of another duplicate',
        );

      // When marking a praise as duplicate, the score is set to 0 and the dismissed flag is cleared
      quantification.score = 0;
      quantification.dismissed = false;
      quantification.duplicatePraise = dp;

      eventLogMessage = `Marked the praise with id "${(
        praise._id as Types.ObjectId
      ).toString()}" as duplicate of the praise with id "${(
        dp._id as Types.ObjectId
      ).toString()}"`;
    } else if (dismissed) {
      // When dismissing a praise, the score is set to 0, any duplicatePraise is cleared and the dismissed flag is set
      quantification.score = 0;
      quantification.dismissed = true;
      quantification.duplicatePraise = undefined;

      eventLogMessage = `Dismissed the praise with id "${(
        praise._id as Types.ObjectId
      ).toString()}"`;
    } else {
      if (!score) {
        throw new ServiceException(
          'Score, dismissed or duplicatePraiseId is required',
        );
      }

      // Check if the score is allowed
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

      // When quantifying a praise, the score is set, any duplicatePraise is cleared and the dismissed flag is cleared
      quantification.score = score;
      quantification.dismissed = false;
      quantification.duplicatePraise = undefined;

      eventLogMessage = `Gave a score of ${
        quantification.score
      } to the praise with id "${(praise._id as Types.ObjectId).toString()}"`;
    }

    // Save updated quantification
    await this.quantificationsService.updateQuantification(quantification);

    const docs: Praise[] = [];

    // Update the score of the praise item and all duplicates
    for (const p of affectedPraises) {
      const score =
        await this.quantificationsService.calculateQuantificationsCompositeScore(
          p,
        );

      const praiseWithScore: Praise = await this.praiseModel
        .findByIdAndUpdate(
          p._id,
          {
            score,
          },
          { new: true },
        )
        .populate('giver receiver forwarder quantifications')
        .lean();

      docs.push(praiseWithScore);
    }

    await this.eventLogService.logEvent({
      typeKey: EventLogTypeKey.PERMISSION,
      description: eventLogMessage,
      periodId: period._id,
    });

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

    const duplicatePraiseItems = await this.praiseModel
      .find({
        _id: {
          $in: duplicateQuantifications.map(
            (q) => q.praise._id === duplicatePraiseId,
          ),
        },
      })
      .lean();

    return duplicatePraiseItems;
  };
}
