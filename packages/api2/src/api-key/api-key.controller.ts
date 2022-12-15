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
  UseGuards,
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

@Controller('api-key')
@UseGuards(PermissionsGuard)
@UseGuards(JwtAuthGuard)
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}
  @Post()
  @Permissions(Permission.ApiKeyManage)
  createApiKey(
    @Body() createApiKeyRequest: CreateApiKeyRequest,
  ): Promise<CreateApiKeyResponse> {
    return this.apiKeyService.createApiKey(createApiKeyRequest);
  }

  @Get()
  @Permissions(Permission.ApiKeyView)
  findAll(): Promise<ApiKey[]> {
    return this.apiKeyService.findAll();
  }

  @Get(':id')
  @Permissions(Permission.ApiKeyView)
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
  @Permissions(Permission.ApiKeyManage)
  async updateApiKeyDescription(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Body() body: UpdateDescriptionRequest,
  ): Promise<ApiKey> {
    return this.apiKeyService.updateDescription(id, body.description);
  }

  @Delete(':id')
  @Permissions(Permission.ApiKeyManage)
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
