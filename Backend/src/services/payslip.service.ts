import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payslip, PayslipDocument } from '../schemas/payslip.schema';

@Injectable()
export class PayslipService {
  constructor(
    @InjectModel(Payslip.name) private payslipModel: Model<PayslipDocument>,
  ) {}

  async findByEmployeeId(
    employeeId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ payslips: Payslip[]; total: number }> {
    const skip = (page - 1) * limit;

    const [payslips, total] = await Promise.all([
      this.payslipModel
        .find({ employeeId })
        .sort({ payPeriodEnd: -1 })
        .skip(skip)
        .limit(limit)
        .populate('employeeId', 'firstName lastName employeeId'),
      this.payslipModel.countDocuments({ employeeId }),
    ]);

    return { payslips, total };
  }

  async findById(id: string): Promise<Payslip> {
    const payslip = await this.payslipModel
      .findById(id)
      .populate('employeeId', 'firstName lastName employeeId');

    if (!payslip) {
      throw new NotFoundException('Payslip not found');
    }
    return payslip;
  }

  async getPayslipsByDateRange(
    employeeId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Payslip[]> {
    return this.payslipModel
      .find({
        employeeId,
        payPeriodStart: { $gte: startDate },
        payPeriodEnd: { $lte: endDate },
      })
      .sort({ payPeriodEnd: -1 })
      .populate('employeeId', 'firstName lastName employeeId');
  }

  async getYearlyPayslips(
    employeeId: string,
    year: number,
  ): Promise<Payslip[]> {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    return this.getPayslipsByDateRange(employeeId, startDate, endDate);
  }

  // Admin methods for creating payslips (Phase 2)
  async create(payslipData: Partial<Payslip>): Promise<Payslip> {
    const payslip = new this.payslipModel(payslipData);
    return payslip.save();
  }

  async updateStatus(id: string, status: string): Promise<Payslip> {
    const payslip = await this.payslipModel.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );

    if (!payslip) {
      throw new NotFoundException('Payslip not found');
    }
    return payslip;
  }
}
