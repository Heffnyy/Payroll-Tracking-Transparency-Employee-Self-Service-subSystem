import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DisputeDocument = Dispute & Document;

export enum DisputeStatus {
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  RESOLVED = 'resolved',
}

export enum DisputeType {
  PAYROLL_ERROR = 'payroll_error',
  MISSING_PAYMENT = 'missing_payment',
  INCORRECT_DEDUCTION = 'incorrect_deduction',
  OVERTIME_DISPUTE = 'overtime_dispute',
  OTHER = 'other',
}

@Schema({ timestamps: true })
export class Dispute {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Payslip' })
  payslipId: Types.ObjectId;

  @Prop({ type: String, enum: DisputeType, required: true })
  disputeType: DisputeType;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ type: String, enum: DisputeStatus, default: DisputeStatus.SUBMITTED })
  status: DisputeStatus;

  @Prop()
  supportingDocuments: string[]; // Array of file paths or URLs

  @Prop()
  adminResponse: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  reviewedBy: Types.ObjectId;

  @Prop()
  reviewedAt: Date;

  @Prop()
  resolutionNotes: string;

  // Timestamps (added by { timestamps: true })
  createdAt?: Date;
  updatedAt?: Date;
}

export const DisputeSchema = SchemaFactory.createForClass(Dispute);
