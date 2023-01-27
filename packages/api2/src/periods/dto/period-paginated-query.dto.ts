import { PaginatedQueryDto } from '@/shared/dto/pagination-query.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class PeriodPaginatedQueryDto extends PaginatedQueryDto {}
