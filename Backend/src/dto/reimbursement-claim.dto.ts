import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { ClaimType } from '../schemas/reimbursement-claim.schema';

export class CreateReimbursementClaimDto {
  @IsEnum(ClaimType)
  claimType: ClaimType;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  amount: number;

  @IsDateString()
  expenseDate: string;
}

export class UpdateClaimStatusDto {
  @IsString()
  @IsNotEmpty()
  adminResponse: string;

  @IsString()
  rejectionReason?: string;
}
