import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReimbursementClaimDocument = ReimbursementClaim & Document;

export enum ClaimStatus {
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PAID = 'paid',
}

export enum ClaimType {
  TRAVEL = 'travel',
  MEAL = 'meal',
  ACCOMMODATION = 'accommodation',
  OFFICE_SUPPLIES = 'office_supplies',
  TRAINING = 'training',
  MEDICAL = 'medical',
  OTHER = 'other',
}

@Schema({ timestamps: true })
export class ReimbursementClaim {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ type: String, enum: ClaimType, required: true })
  claimType: ClaimType;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  expenseDate: Date;

  @Prop({ type: String, enum: ClaimStatus, default: ClaimStatus.SUBMITTED })
  status: ClaimStatus;

  @Prop()
  receipts: string[]; // Array of file paths or URLs

  @Prop()
  adminResponse: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  reviewedBy: Types.ObjectId;

  @Prop()
  reviewedAt: Date;

  @Prop()
  paymentDate: Date;

  @Prop()
  rejectionReason: string;

  // Timestamps (added by { timestamps: true })
  createdAt?: Date;
  updatedAt?: Date;
}

export const ReimbursementClaimSchema =
  SchemaFactory.createForClass(ReimbursementClaim);
