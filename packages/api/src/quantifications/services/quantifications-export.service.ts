import { ExportInputDto } from '../../shared/dto/export-input.dto';
import { Cursor, Model } from 'mongoose';
import { Praise, PraiseSchema } from '../../praise/schemas/praise.schema';
import { exportInputToQuery } from '../../shared/export.shared';
import { DbService } from '../../database/services/db.service';
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class QuantificationsExportService {
  private praiseModel: Model<Praise>;

  constructor(private dbService: DbService) {
    this.praiseModel = this.dbService.getModel<Praise>('praise', PraiseSchema);
  }

  /**
   * Counts the number of quantifications that match the given query
   */
  private async countQuantifications(query: any): Promise<number> {
    const count = await this.praiseModel.aggregate([
      {
        $match: query,
      },
      {
        $lookup: {
          from: 'quantifications',
          localField: '_id',
          foreignField: 'praise',
          as: 'quantification',
        },
      },
      { $unwind: '$quantification' },
      { $count: 'count' },
    ]);
    return count.length === 0 || count[0].count === 0 ? 0 : count[0].count;
  }

  /**
   * Creates a cursor that can be used to iterate over the quantifications that match the given query
   */
  async exportCursor(options: ExportInputDto): Promise<Cursor<any, never>> {
    const query = await exportInputToQuery(options);

    return this.praiseModel
      .aggregate([
        {
          $match: query,
        },
        {
          $lookup: {
            from: 'quantifications',
            localField: '_id',
            foreignField: 'praise',
            as: 'quantification',
          },
        },
        { $unwind: '$quantification' },
        {
          $project: {
            _id: '$quantification._id',
            praise: '$quantification.praise',
            quantifier: '$quantification.quantifier',
            score: '$quantification.score',
            scoreRealized: '$quantification.scoreRealized',
            dismissed: '$quantification.dismissed',
            duplicatePraise: '$quantification.duplicatePraise',
            createdAt: '$quantification.createdAt',
            updatedAt: '$quantification.updatedAt',
          },
        },
      ])
      .cursor();
  }
}
