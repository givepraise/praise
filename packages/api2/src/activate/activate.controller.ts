import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ActivateInputDto } from './dto/activate-input.dto';
import { User } from '@/users/schemas/users.schema';
import { ActivateService } from './activate.service';

@Controller('activate')
@SerializeOptions({
  excludePrefixes: ['__'],
})
@UseInterceptors(ClassSerializerInterceptor)
export class ActivateController {
  constructor(private activateService: ActivateService) {}

  @Post()
  @ApiOperation({
    summary:
      'Activate a user account in order to be able to give praise and receive rewards. Activation a user account creates a new User object or adds user account to User if it already exists.',
  })
  @ApiResponse({
    status: 200,
    description: 'The created (or updated) user.',
    type: User,
  })
  activate(@Body() activateInputDto: ActivateInputDto): Promise<User> {
    return this.activateService.activate(activateInputDto);
  }
}
