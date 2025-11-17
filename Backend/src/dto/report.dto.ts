import {
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { ReportType } from '../schemas/report.schema';

export class GenerateReportDto {
  @IsEnum(ReportType)
  reportType: ReportType;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  // Department filter (for department reports)
  @IsOptional()
  @IsString()
  department?: string;

  // Date range filters
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  // Year filter
  @IsOptional()
  @IsNumber()
  @Min(2000)
  @Max(2100)
  year?: number;

  // Month filter (1-12)
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(12)
  month?: number;
}

export class ReportQueryDto {
  @IsOptional()
  @IsEnum(ReportType)
  reportType?: ReportType;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsNumber()
  year?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}
