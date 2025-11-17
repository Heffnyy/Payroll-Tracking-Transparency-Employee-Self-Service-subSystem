import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  IsMongoId,
} from 'class-validator';
import { DisputeType } from '../schemas/dispute.schema';

export class CreateDisputeDto {
  @IsMongoId()
  @IsOptional()
  payslipId?: string;

  @IsEnum(DisputeType)
  disputeType: DisputeType;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  amount: number;
}

export class UpdateDisputeStatusDto {
  @IsString()
  @IsNotEmpty()
  adminResponse: string;

  @IsString()
  @IsOptional()
  resolutionNotes?: string;
}
