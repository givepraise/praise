import { PermissionsGuard } from '@/auth/guards/permissions.guard';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiKeyService } from './api-key.service';
import { CreateApiKeyInputDto } from './dto/create-api-key-input.dto';
import { Permissions } from '@/auth/decorators/permissions.decorator';
import { Permission } from '@/auth/enums/permission.enum';
import { CreateApiKeyResponseDto } from './dto/create-api-key-response';
import { ObjectIdPipe } from '@/shared/pipes/object-id.pipe';
import { Types } from 'mongoose';
import { ApiKey } from './schemas/api-key.schema';
import { UpdateDescriptionInputDto } from './dto/update-description-input.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MongooseClassSerializerInterceptor } from '@/shared/interceptors/mongoose-class-serializer.interceptor';
import { AuthGuard } from '@nestjs/passport';

@Controller('api-key')
@ApiTags('API Key')
@UseGuards(PermissionsGuard)
@UseGuards(AuthGuard(['jwt', 'api-key']))
@SerializeOptions({
  excludePrefixes: ['__'],
})
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
  @Permissions(Permission.ApiKeyView)
  @UseInterceptors(MongooseClassSerializerInterceptor(ApiKey))
  async findOne(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
  ): Promise<ApiKey> {
    const apiKey = await this.apiKeyService.findOne(id);
    if (!apiKey) {
      throw new BadRequestException('Invalid API key ID');
    }
    return apiKey;
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
  @Permissions(Permission.ApiKeyManage)
  @UseInterceptors(MongooseClassSerializerInterceptor(ApiKey))
  async revokeApiKey(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
  ): Promise<ApiKey> {
    const apiKey = await this.apiKeyService.findOne(id);
    if (!apiKey) {
      throw new BadRequestException('Invalid API key ID');
    }
    await this.apiKeyService.revoke(id);
    return apiKey;
  }
}
