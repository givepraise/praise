import { Module } from '@nestjs/common';
import { SharedService } from './shared.service';

@Module({
  providers: [SharedService],
})
export class SharedModule {}
