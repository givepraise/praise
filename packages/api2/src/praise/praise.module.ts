import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PraiseController } from './praise.controller';
import { PraiseService } from './praise.service';
import { Praise, PraiseSchema } from './schemas/praise.schema';
import { QuantificationsModule } from '@/quantifications/quantifications.module';
import { PeriodsModule } from '@/periods/periods.module';
import { SettingsModule } from '@/settings/settings.module';
import { EventLogModule } from '@/event-log/event-log.module';
import { QuantificationsService } from '@/quantifications/quantifications.service';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Praise.name,
        imports: [QuantificationsModule],
        useFactory: (quantificationsService: QuantificationsService) => {
          const schema = PraiseSchema;
          schema.pre('save', async function () {
            // this.score =
            //   await quantificationsService.calculateQuantificationsCompositeScore(
            //     this,
            //   );
            // console.log('score', this.score);
            // console.log('pre save', this);
          });
          return schema;
        },
        inject: [QuantificationsService],
      },
    ]),
    PeriodsModule,
    QuantificationsModule,
    SettingsModule,
    EventLogModule,
  ],
  controllers: [PraiseController],
  providers: [PraiseService],
  exports: [PraiseService],
})
export class PraiseModule {}
