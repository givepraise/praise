import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { ConfigurationValueDto } from './configuration-value.dto';

@ApiExtraModels(ConfigurationValueDto)
export class ReportManifestDto {
  @ApiProperty({
    example:
      'https://raw.githubusercontent.com/givepraise/reports/main/reports/disperse-dist-straight-curve-with-ceiling/manifest.json',
    type: String,
    required: false,
  })
  manifestUrl: string;

  @ApiProperty({
    example: 'simple-report',
    type: String,
    required: true,
  })
  name: string;

  @ApiProperty({
    example: 'Simple Report',
    type: String,
    required: true,
  })
  displayName: string;

  @ApiProperty({
    example: 'A simple report.',
    type: String,
    required: true,
  })
  description: string;

  @ApiProperty({
    example: '1.2.3',
    type: String,
    required: true,
  })
  version: string;

  @ApiProperty({
    example: 'General Magic',
    type: String,
    required: true,
  })
  author: string;

  @ApiProperty({
    example: 'general-magic',
    type: String,
    required: true,
  })
  publisher: string;

  @ApiProperty({
    example: 'MIT',
    type: String,
    required: true,
  })
  license: string;

  @ApiProperty({
    example: 'https://github.com/givepraise/reports',
    type: String,
    required: true,
  })
  repository: string;

  @ApiProperty({
    example: 'https://github.com/givepraise/reports/issues',
    type: String,
    required: true,
  })
  bugs: string;

  @ApiProperty({
    example: ['Basic reports', 'Praise receiver reports'],
    type: [String],
    required: true,
  })
  categories: string[];

  @ApiProperty({
    example: ['toplist'],
    type: [String],
    required: true,
  })
  keywords: string[];

  @ApiProperty({
    description: 'Configuration settings for the report',
    required: true,
    type: 'object',
    additionalProperties: {
      oneOf: [{ $ref: '#/components/schemas/ConfigurationValueDto' }],
    },
  })
  configuration?: Record<string, ConfigurationValueDto>;
}
