import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
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
import { CreateApiKeyRequest } from './dto/create-api-key-request.dto';
import { Permissions } from '@/auth/decorators/permissions.decorator';
import { Permission } from '@/auth/enums/permission.enum';
import { CreateApiKeyResponse } from './dto/create-api-key-response';
import { ObjectIdPipe } from '@/shared/pipes/object-id.pipe';
import { Types } from 'mongoose';
import { ApiKey } from './schemas/api-key.schema';
import { UpdateDescriptionRequest } from './dto/update-description-request.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MongooseClassSerializerInterceptor } from '@/shared/mongoose-class-serializer.interceptor';

@Controller('api-key')
@UseGuards(PermissionsGuard)
@UseGuards(JwtAuthGuard)
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
    type: CreateApiKeyResponse,
  })
  @Permissions(Permission.ApiKeyManage)
  createApiKey(
    @Body() createApiKeyRequest: CreateApiKeyRequest,
  ): Promise<CreateApiKeyResponse> {
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
    @Body() body: UpdateDescriptionRequest,
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
