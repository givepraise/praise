import { BadRequestError, NotFoundError } from '@error/errors';
import { UserModel } from '@user/entities';
import { settingValue } from '@shared/settings';
import { TypedResponse } from '@shared/types';
import { UserRole } from '@user/types';
import { PraiseModel } from '@praise/entities';
import { EventLogTypeKey } from '@eventlog/types';
import { logEvent } from '@eventlog/utils';
import flatten from 'lodash/flatten';
import { StatusCodes } from 'http-status-codes';
import { Request } from 'express';
import {
  PeriodDetailsDto,
  PeriodStatusType,
  VerifyQuantifierPoolSizeResponse,
} from '../types';
import { findPeriodDetailsDto, isAnyPraiseAssigned } from '../utils/core';
import { assignQuantifiersDryRun } from '../utils/assignment';
import { PeriodModel } from '../entities';

/**
 * Description
 * @param
 */
export const verifyQuantifierPoolSize = async (
  req: Request,
  res: TypedResponse<VerifyQuantifierPoolSizeResponse>
): Promise<void> => {
  const period = await PeriodModel.findById(req.params.periodId);
  if (!period) throw new NotFoundError('Period');

  const PRAISE_QUANTIFIERS_ASSIGN_ALL = (await settingValue(
    'PRAISE_QUANTIFIERS_ASSIGN_ALL',
    period._id
  )) as boolean;

  const quantifierPoolSize = await UserModel.count({
    roles: UserRole.QUANTIFIER,
  });

  let response;

  if (PRAISE_QUANTIFIERS_ASSIGN_ALL) {
    response = {
      quantifierPoolSize,
      quantifierPoolSizeNeeded: quantifierPoolSize,
      quantifierPoolDeficitSize: 0,
    };
  } else {
    const assignments = await assignQuantifiersDryRun(req.params.periodId);

    response = {
      quantifierPoolSize,
      quantifierPoolSizeNeeded: assignments.poolAssignments.length,
      quantifierPoolDeficitSize: assignments.remainingAssignmentsCount,
    };
  }

  res.status(StatusCodes.OK).json(response);
};

/**
 * Description
 * @param
 */
export const assignQuantifiers = async (
  req: Request,
  res: TypedResponse<PeriodDetailsDto>
): Promise<void> => {
  const { periodId } = req.params;
  const period = await PeriodModel.findById(periodId);
  if (!period) throw new NotFoundError('Period');
  if (period.status !== 'OPEN')
    throw new BadRequestError(
      'Quantifiers can only be assigned on OPEN periods.'
    );

  const anyPraiseAssigned = await isAnyPraiseAssigned(period);
  if (anyPraiseAssigned)
    throw new BadRequestError(
      'Some praise has already been assigned for this period'
    );

  const assignedQuantifiers = await assignQuantifiersDryRun(
    req.params.periodId
  );

  if (assignedQuantifiers.remainingAssignmentsCount > 0)
    throw new BadRequestError(
      `Failed to assign ${assignedQuantifiers.remainingAssignmentsCount} collection of praise to a quantifier`
    );

  // Generate list of db queries to apply changes specified by assignedQuantifiers
  const bulkQueries = flatten(
    assignedQuantifiers.poolAssignments.map((q) =>
      q.receivers.map((receiver) => ({
        updateMany: {
          filter: { _id: { $in: receiver.praiseIds } },
          update: {
            $push: {
              quantifications: {
                quantifier: q._id,
                score: 0,
                dismissed: false,
              },
            },
          },
        },
      }))
    )
  );

  await PraiseModel.bulkWrite(bulkQueries);
  await PeriodModel.updateOne(
    { _id: period._id },
    { $set: { status: PeriodStatusType.QUANTIFY } }
  );

  await logEvent(
    EventLogTypeKey.PERIOD,
    `Assigned random quantifiers to all praise in period "${period.name}"`,
    {
      userId: res.locals.currentUser._id,
    }
  );

  const periodDetailsDto = await findPeriodDetailsDto(periodId);
  res.status(StatusCodes.OK).json(periodDetailsDto);
};
