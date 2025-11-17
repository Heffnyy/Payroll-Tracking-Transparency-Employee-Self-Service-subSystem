import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PayslipDocument = Payslip & Document;

export enum PayslipStatus {
  DRAFT = 'draft',
  PROCESSED = 'processed',
  PAID = 'paid',
  DISPUTED = 'disputed',
}

@Schema({ timestamps: true })
export class Payslip {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true })
  payPeriodStart: Date;

  @Prop({ required: true })
  payPeriodEnd: Date;

  @Prop({ required: true })
  payDate: Date;

  @Prop({ required: true })
  baseSalary: number;

  @Prop({ default: 0 })
  overtime: number;

  @Prop({ default: 0 })
  bonus: number;

  @Prop({ default: 0 })
  leaveCompensation: number;

  @Prop({ default: 0 })
  transportationAllowance: number;

  @Prop({ default: 0 })
  otherAllowances: number;

  @Prop({ required: true })
  grossPay: number;

  @Prop({ default: 0 })
  incomeTax: number;

  @Prop({ default: 0 })
  socialSecurityTax: number;

  @Prop({ default: 0 })
  healthInsurance: number;

  @Prop({ default: 0 })
  pensionContribution: number;

  @Prop({ default: 0 })
  otherDeductions: number;

  @Prop({ required: true })
  totalDeductions: number;

  @Prop({ required: true })
  netPay: number;

  @Prop({ type: String, enum: PayslipStatus, default: PayslipStatus.DRAFT })
  status: PayslipStatus;

  @Prop()
  payslipDocument: string; // File path or URL

  @Prop()
  taxDocument: string; // File path or URL

  @Prop({ default: false })
  isDisputed: boolean;
}

export const PayslipSchema = SchemaFactory.createForClass(Payslip);
