import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommunityService } from './community.service';
import { Community, CommunitySchema } from './schemas/community.schema';
import { CommunityController } from './community.controller';
import { AuthModule } from '@/auth/auth.module';
import { ApiKeyModule } from '@/api-key/api-key.module';
import {
  ConstantsProvider,
  PRAISE_DB_NAME,
} from '@/constants/constants.provider';

@Module({
  imports: [
    MongooseModule.forRoot(
      `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${PRAISE_DB_NAME}?authSource=admin&appname=PraiseApi`,
      { connectionName: 'praise' },
    ),
    MongooseModule.forFeature(
      [
        {
          name: Community.name,
          schema: CommunitySchema,
        },
      ],
      'praise',
    ),
    forwardRef(() => AuthModule),
    forwardRef(() => ApiKeyModule),
  ],
  controllers: [CommunityController],
  providers: [CommunityService, ConstantsProvider],
  exports: [CommunityService],
})
export class CommunityModule {}
