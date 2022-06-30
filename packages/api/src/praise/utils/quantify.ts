import { Types } from 'mongoose';
import { BadRequestError, NotFoundError } from '@/error/errors';
import { EventLogTypeKey } from '@/eventlog/types';
import { logEvent } from '@/eventlog/utils';
import { PeriodStatusType } from '@/period/types';
import { PraiseModel } from '@/praise/entities';
import { PraiseDocument } from '@/praise/types';
import { getPraisePeriod } from '@/praise/utils/core';
import { UserDocument } from '@/user/types';

interface BodyParams {
  score: number;
  dismissed?: boolean;
  duplicatePraise?: string;
}

interface QuantifyPraiseProps {
  id: string;
  bodyParams: BodyParams;
  currentUser: UserDocument;
}

export const quantifyPraise = async ({
  id,
  bodyParams,
  currentUser,
}: QuantifyPraiseProps): Promise<PraiseDocument[]> => {
  const { score, dismissed, duplicatePraise } = bodyParams;

  const praise = await PraiseModel.findById(id).populate(
    'giver receiver forwarder'
  );
  if (!praise) throw new NotFoundError('Praise');

  const period = await getPraisePeriod(praise);
  if (!period)
    throw new BadRequestError('Praise does not have an associated period');

  if (period.status !== PeriodStatusType.QUANTIFY)
    throw new BadRequestError(
      'Period associated with praise does have status QUANTIFY'
    );

  const quantification = praise.quantifications.find((q) =>
    q.quantifier.equals(currentUser._id)
  );

  if (!quantification)
    throw new BadRequestError('User not assigned as quantifier for praise.');

  let eventLogMessage = '';

  // Collect all affected praises (i.e. any praises whose scoreRealized will change as a result of this change)
  const affectedPraises: PraiseDocument[] = [praise];

  const praisesDuplicateOfThis = await PraiseModel.find({
    quantifications: {
      $elemMatch: {
        quantifier: currentUser._id,
        duplicatePraise: praise._id,
      },
    },
  }).populate('giver receiver forwarder');

  if (praisesDuplicateOfThis?.length > 0)
    affectedPraises.push(...praisesDuplicateOfThis);

  // Modify praise quantification values
  if (duplicatePraise) {
    if (duplicatePraise === praise._id.toString())
      throw new BadRequestError('Praise cannot be a duplicate of itself');

    const dp = await PraiseModel.findById(duplicatePraise);
    if (!dp) throw new BadRequestError('Duplicate praise item not found');

    if (praisesDuplicateOfThis?.length > 0)
      throw new BadRequestError(
        'Praise cannot be marked duplicate when it is the original of another duplicate'
      );

    const praisesDuplicateOfAnotherDuplicate = await PraiseModel.find({
      _id: duplicatePraise,
      quantifications: {
        $elemMatch: {
          quantifier: currentUser._id,
          duplicatePraise: { $exists: 1 },
        },
      },
    });

    if (praisesDuplicateOfAnotherDuplicate?.length > 0)
      throw new BadRequestError(
        'Praise cannot be marked duplicate of another duplicate'
      );

    quantification.score = 0;
    quantification.dismissed = false;
    quantification.duplicatePraise = dp._id;

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

  await logEvent(
    EventLogTypeKey.QUANTIFICATION,
    eventLogMessage,
    {
      userId: currentUser._id,
    },
    period._id
  );

  return affectedPraises;
};
