import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';
import { ApiKeyService } from './api-key.service';
import { CreateApiKeyInputDto } from './dto/create-api-key-input.dto';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/enums/permission.enum';
import { CreateApiKeyResponseDto } from './dto/create-api-key-response';
import { ObjectIdPipe } from '../shared/pipes/object-id.pipe';
import { Types } from 'mongoose';
import { ApiKey } from './schemas/api-key.schema';
import { UpdateDescriptionInputDto } from './dto/update-description-input.dto';
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { MongooseClassSerializerInterceptor } from '../shared/interceptors/mongoose-class-serializer.interceptor';
import { EnforceAuthAndPermissions } from '../auth/decorators/enforce-auth-and-permissions.decorator';

@Controller('api-key')
@ApiTags('API Key')
@SerializeOptions({
  excludePrefixes: ['__'],
})
@EnforceAuthAndPermissions()
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}
  @Post()
  @ApiOperation({
    summary: 'Create API key',
  })
  @ApiResponse({
    status: 201,
    description: 'API key created',
    type: CreateApiKeyResponseDto,
  })
  @Permissions(Permission.ApiKeyManage)
  @UseInterceptors(MongooseClassSerializerInterceptor(ApiKey))
  createApiKey(
    @Body() createApiKeyRequest: CreateApiKeyInputDto,
  ): Promise<CreateApiKeyResponseDto> {
    return this.apiKeyService.createApiKey(createApiKeyRequest);
  }

  @Get()
  @ApiOperation({
    summary: 'List all API keys',
  })
  @ApiResponse({
    status: 200,
    description: 'Array of API keys',
    type: [ApiKey],
  })
  @Permissions(Permission.ApiKeyView)
  @UseInterceptors(MongooseClassSerializerInterceptor(ApiKey))
  findAll(): Promise<ApiKey[]> {
    return this.apiKeyService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get API key by ID',
  })
  @ApiResponse({
    status: 200,
    description: 'An API key',
    type: ApiKey,
  })
  @ApiParam({ name: 'id', type: 'string' })
  @Permissions(Permission.ApiKeyView)
  @UseInterceptors(MongooseClassSerializerInterceptor(ApiKey))
  async findOne(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
  ): Promise<ApiKey> {
    return this.apiKeyService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update API key description',
  })
  @ApiResponse({
    status: 201,
    description: 'API key with updated description',
    type: ApiKey,
  })
  @ApiParam({ name: 'id', type: 'string' })
  @Permissions(Permission.ApiKeyManage)
  @UseInterceptors(MongooseClassSerializerInterceptor(ApiKey))
  async updateApiKeyDescription(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Body() body: UpdateDescriptionInputDto,
  ): Promise<ApiKey> {
    return this.apiKeyService.updateDescription(id, body.description);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Revoke API key',
  })
  @ApiResponse({
    status: 201,
    description: 'Revoked API key',
    type: ApiKey,
  })
  @ApiParam({ name: 'id', type: 'string' })
  @Permissions(Permission.ApiKeyManage)
  @UseInterceptors(MongooseClassSerializerInterceptor(ApiKey))
  async revokeApiKey(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
  ): Promise<ApiKey> {
    return this.apiKeyService.revoke(id);
  }
}
