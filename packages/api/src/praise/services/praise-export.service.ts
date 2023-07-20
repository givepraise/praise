import { Praise, PraiseSchema } from '../schemas/praise.schema';
import { Injectable, Scope } from '@nestjs/common';
import { ExportInputDto } from '../../shared/dto/export-input.dto';
import { Cursor, Model } from 'mongoose';
import { exportInputToQuery } from '../../shared/export.shared';
import { DbService } from '../../database/services/db.service';

@Injectable({ scope: Scope.REQUEST })
export class PraiseExportService {
  private praiseModel: Model<Praise>;

  constructor(private dbService: DbService) {
    this.praiseModel = this.dbService.getModel<Praise>(
      Praise.name,
      PraiseSchema,
    );
  }

  /**
   * Creates a cursor for all users in the database
   */
  async exportCursor(
    options: ExportInputDto,
    includeFields: string[],
  ): Promise<Cursor<Praise, never>> {
    const query = await exportInputToQuery(options);

    // Include only the fields that are specified in the includeFields array
    const projection: { [key: string]: 1 } = includeFields.reduce(
      (obj: { [key: string]: 1 }, field: string) => {
        obj[field] = 1;
        return obj;
      },
      {},
    );
    return this.praiseModel
      .aggregate([
        {
          $match: query,
        },
        { $project: projection },
      ])
      .cursor();
  }
}
