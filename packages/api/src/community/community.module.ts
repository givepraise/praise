import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommunityService } from './community.service';
import { Community, CommunitySchema } from './schemas/community.schema';
import { CommunityController } from './community.controller';
import { ConstantsProvider } from '../constants/constants.provider';
import { AuthGuardModule } from '../auth/auth-guard.module';
import { dbUrlMain } from '../database/utils/db-url-main';
import { EventLogModule } from '../event-log/event-log.module';
import { EmailService } from '../email/email.service';

@Module({
  imports: [
    MongooseModule.forRoot(dbUrlMain(), { connectionName: 'praise' }),
    MongooseModule.forFeature(
      [
        {
          name: Community.name,
          schema: CommunitySchema,
        },
      ],
      'praise',
    ),
    AuthGuardModule,
    EventLogModule,
  ],
  controllers: [CommunityController],
  providers: [EmailService, CommunityService, ConstantsProvider],
  exports: [CommunityService],
})
export class CommunityModule {}
