import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommunityService } from './community.service';
import { Community, CommunitySchema } from './schemas/community.schema';
import { CommunityController } from './community.controller';
import { AuthModule } from '@/auth/auth.module';
import { ApiKeyModule } from '@/api-key/api-key.module';
import { ConstantsProvider } from '@/constants/constants.provider';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Community.name, schema: CommunitySchema },
    ]),
    AuthModule,
    ApiKeyModule,
  ],
  controllers: [CommunityController],
  providers: [CommunityService, ConstantsProvider],
  exports: [
    CommunityService,
    MongooseModule.forFeature([
      { name: Community.name, schema: CommunitySchema },
    ]),
  ],
})
export class CommunityModule {}
