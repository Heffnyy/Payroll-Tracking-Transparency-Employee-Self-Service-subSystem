import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReportDocument = Report & Document;

export enum ReportType {
  DEPARTMENT_SUMMARY = 'department_summary',
  MONTH_END_SUMMARY = 'month_end_summary',
  YEAR_END_SUMMARY = 'year_end_summary',
  TAX_REPORT = 'tax_report',
  INSURANCE_REPORT = 'insurance_report',
  BENEFITS_REPORT = 'benefits_report',
  COST_ALLOCATION = 'cost_allocation',
  PAYROLL_PERFORMANCE = 'payroll_performance',
}

export enum ReportStatus {
  GENERATING = 'generating',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Schema({ timestamps: true })
export class Report {
  @Prop({ type: String, enum: ReportType, required: true })
  reportType: ReportType;

  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  generatedBy: Types.ObjectId;

  @Prop({ type: String, enum: ReportStatus, default: ReportStatus.GENERATING })
  status: ReportStatus;

  // Report parameters
  @Prop()
  department: string;

  @Prop()
  startDate: Date;

  @Prop()
  endDate: Date;

  @Prop()
  year: number;

  @Prop()
  month: number;

  // Report data (stored as JSON)
  @Prop({ type: Object })
  data: Record<string, unknown>;

  // Summary statistics
  @Prop({ type: Object })
  summary: {
    totalEmployees?: number;
    totalGrossPay?: number;
    totalDeductions?: number;
    totalNetPay?: number;
    totalTax?: number;
    totalInsurance?: number;
    totalBenefits?: number;
  };

  // File path if exported to PDF/Excel
  @Prop()
  exportedFile: string;

  // Timestamps (added by { timestamps: true })
  createdAt?: Date;
  updatedAt?: Date;
}

export const ReportSchema = SchemaFactory.createForClass(Report);
