import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommunityService } from './community.service';
import { Community, CommunitySchema } from './schemas/community.schema';
import { CommunityController } from './community.controller';
import {
  ConstantsProvider,
  DB_URL_MAIN_DB,
} from '../constants/constants.provider';
import { AuthGuardModule } from '../auth/auth-guard.module';

@Module({
  imports: [
    MongooseModule.forRoot(DB_URL_MAIN_DB, { connectionName: 'praise' }),
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
  ],
  controllers: [CommunityController],
  providers: [CommunityService, ConstantsProvider],
  exports: [CommunityService],
})
export class CommunityModule {}
