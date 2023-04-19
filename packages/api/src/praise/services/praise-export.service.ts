import { InjectModel } from '@nestjs/mongoose';
import { Praise } from '../schemas/praise.schema';
import { Injectable } from '@nestjs/common';
import { ExportInputDto } from '../../shared/dto/export-input.dto';
import { Cursor, Model } from 'mongoose';
import { exportInputToQuery } from '../../shared/export.shared';

@Injectable()
export class PraiseExportService {
  constructor(
    @InjectModel(Praise.name)
    private praiseModel: Model<Praise>,
  ) {}

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
