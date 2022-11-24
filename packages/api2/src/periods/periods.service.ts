import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Period, PeriodDocument } from './schemas/periods.schema';

@Injectable()
export class PeriodsService {
  constructor(
    @InjectModel(Period.name)
    private periodModel: Model<PeriodDocument>,
  ) {}

  async findAll(): Promise<Period[]> {
    const periods = await this.periodModel.find().lean();
    return periods.map((period) => new Period(period));
  }

  async findOneById(_id: Types.ObjectId): Promise<Period> {
    const period = await this.periodModel.findById(_id).lean();
    if (!period) throw new NotFoundException('Period not found.');
    return new Period(period);
  }

  // async findLatest(): Promise<Period> {
  //   const period = (await this.periodModel
  //     .findOne({})
  //     .sort({ endDate: -1 })) as PeriodDocument;

  //   return new Period(period);
  // }

  // async createPeriod(createPeriodDto: CreatePeriodDto): Promise<Period> {
  //   const { name, endDate: endDateInput } = createPeriodDto;

  //   if (!name || !endDateInput)
  //     throw new BadRequestException('Period name and endDate are required');

  //   const endDate = parseISO(endDateInput);

  //   const latestPeriod = await this.findLatest();
  //   if (latestPeriod) {
  //     const earliestDate = add(latestPeriod.endDate, { days: 7 });
  //     if (compareAsc(earliestDate, endDate) === 1) {
  //       throw new BadRequestException(
  //         'End date must be at least 7 days after the latest end date',
  //       );
  //     }
  //   }

  //   const period = await this.periodModel.create({ name, endDate });

  //   // await insertNewPeriodSettings(period);
  //   // const periodDetailsDto = await findPeriodDetailsDto(period._id);

  //   return period;
  // }
}
