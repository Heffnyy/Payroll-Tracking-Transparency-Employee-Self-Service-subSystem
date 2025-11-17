import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Report,
  ReportDocument,
  ReportType,
  ReportStatus,
} from '../schemas/report.schema';
import { Payslip, PayslipDocument } from '../schemas/payslip.schema';
import { Employee, EmployeeDocument } from '../schemas/employee.schema';
import { ReportQueryDto } from '../dto/report.dto';

// Interface for populated employee data in payslips
interface PopulatedEmployee {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  employeeId: string;
  position?: string;
  department?: string;
}

// Interface for payslip with populated employee
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
interface PayslipWithEmployee extends Omit<PayslipDocument, 'employeeId'> {
  employeeId: PopulatedEmployee | any; // Can be ObjectId or populated
}

// Interface for employee data accumulator
interface EmployeeDataAcc {
  [key: string]: {
    employee: PopulatedEmployee;
    payslips: PayslipWithEmployee[];
    totalGross: number;
    totalNet: number;
    totalTax: number;
  };
}

// Interface for department data accumulator
interface DepartmentDataAcc {
  [key: string]: {
    department: string;
    employeeCount: number;
    totalGross: number;
    totalNet: number;
    totalTax: number;
  };
}

// Interface for employee tax data
interface EmployeeTaxData {
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  employee: PopulatedEmployee | any; // Mongoose populated types can be any
  totalIncomeTax: number;
  totalSocialSecurity: number;
  totalTax: number;
}

@Injectable()
export class ReportService {
  constructor(
    @InjectModel(Report.name) private reportModel: Model<ReportDocument>,
    @InjectModel(Payslip.name) private payslipModel: Model<PayslipDocument>,
    @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
  ) {}

  // Generate Department Summary Report
  async generateDepartmentReport(
    userId: string,
    department: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Report> {
    // Get all employees in the department
    const employees = await this.employeeModel.find({
      department,
      isActive: true,
    });
    const employeeIds = employees.map((emp) => emp._id);

    // Get all payslips for this department in the date range
    const payslips = (await this.payslipModel
      .find({
        employeeId: { $in: employeeIds },
        payPeriodStart: { $gte: startDate },
        payPeriodEnd: { $lte: endDate },
      })
      .populate(
        'employeeId',
        'firstName lastName employeeId position',
      )) as PayslipWithEmployee[];

    // Calculate statistics
    const totalGrossPay = payslips.reduce((sum, p) => sum + p.grossPay, 0);
    const totalDeductions = payslips.reduce(
      (sum, p) => sum + p.totalDeductions,
      0,
    );
    const totalNetPay = payslips.reduce((sum, p) => sum + p.netPay, 0);
    const totalTax = payslips.reduce(
      (sum, p) => sum + (p.incomeTax + p.socialSecurityTax),
      0,
    );
    const totalInsurance = payslips.reduce(
      (sum, p) => sum + p.healthInsurance,
      0,
    );
    const totalBenefits = payslips.reduce(
      (sum, p) =>
        sum +
        (p.bonus +
          p.leaveCompensation +
          p.transportationAllowance +
          p.otherAllowances),
      0,
    );

    // Group by employee
    const employeeData = payslips.reduce<EmployeeDataAcc>((acc, payslip) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const empId = payslip.employeeId._id.toString();
      if (!acc[empId]) {
        acc[empId] = {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          employee: payslip.employeeId,
          payslips: [],
          totalGross: 0,
          totalNet: 0,
          totalTax: 0,
        };
      }
      acc[empId].payslips.push(payslip);
      acc[empId].totalGross += payslip.grossPay;
      acc[empId].totalNet += payslip.netPay;
      acc[empId].totalTax += payslip.incomeTax + payslip.socialSecurityTax;
      return acc;
    }, {});

    // Create report
    const report = new this.reportModel({
      reportType: ReportType.DEPARTMENT_SUMMARY,
      title: `${department} Department Report`,
      description: `Department summary from ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
      generatedBy: userId,
      department,
      startDate,
      endDate,
      status: ReportStatus.COMPLETED,
      data: {
        employees: Object.values(employeeData),
        payslipsCount: payslips.length,
      },
      summary: {
        totalEmployees: employees.length,
        totalGrossPay,
        totalDeductions,
        totalNetPay,
        totalTax,
        totalInsurance,
        totalBenefits,
      },
    });

    return report.save();
  }

  // Generate Month-End Summary Report
  async generateMonthEndReport(
    userId: string,
    year: number,
    month: number,
  ): Promise<Report> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const payslips = (await this.payslipModel
      .find({
        payPeriodStart: { $gte: startDate },
        payPeriodEnd: { $lte: endDate },
      })
      .populate(
        'employeeId',
        'firstName lastName department position',
      )) as PayslipWithEmployee[];

    // Calculate totals
    const totalGrossPay = payslips.reduce((sum, p) => sum + p.grossPay, 0);
    const totalDeductions = payslips.reduce(
      (sum, p) => sum + p.totalDeductions,
      0,
    );
    const totalNetPay = payslips.reduce((sum, p) => sum + p.netPay, 0);
    const totalTax = payslips.reduce(
      (sum, p) => sum + (p.incomeTax + p.socialSecurityTax),
      0,
    );
    const totalInsurance = payslips.reduce(
      (sum, p) => sum + p.healthInsurance,
      0,
    );

    // Group by department
    const departmentData = payslips.reduce<DepartmentDataAcc>(
      (acc, payslip) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const dept = payslip.employeeId.department || 'Unknown';
        if (!acc[dept]) {
          acc[dept] = {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            department: dept,
            employeeCount: 0,
            totalGross: 0,
            totalNet: 0,
            totalTax: 0,
          };
        }
        acc[dept].employeeCount++;
        acc[dept].totalGross += payslip.grossPay;
        acc[dept].totalNet += payslip.netPay;
        acc[dept].totalTax += payslip.incomeTax + payslip.socialSecurityTax;
        return acc;
      },
      {},
    );

    const report = new this.reportModel({
      reportType: ReportType.MONTH_END_SUMMARY,
      title: `Month-End Report - ${year}/${month}`,
      description: `Monthly payroll summary for ${new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}`,
      generatedBy: userId,
      year,
      month,
      startDate,
      endDate,
      status: ReportStatus.COMPLETED,
      data: {
        departments: Object.values(departmentData),
        payslipsProcessed: payslips.length,
      },
      summary: {
        totalEmployees: payslips.length,
        totalGrossPay,
        totalDeductions,
        totalNetPay,
        totalTax,
        totalInsurance,
      },
    });

    return report.save();
  }

  // Generate Year-End Summary Report
  async generateYearEndReport(userId: string, year: number): Promise<Report> {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const payslips = await this.payslipModel
      .find({
        payPeriodStart: { $gte: startDate },
        payPeriodEnd: { $lte: endDate },
      })
      .populate('employeeId', 'firstName lastName department');

    const totalGrossPay = payslips.reduce((sum, p) => sum + p.grossPay, 0);
    const totalDeductions = payslips.reduce(
      (sum, p) => sum + p.totalDeductions,
      0,
    );
    const totalNetPay = payslips.reduce((sum, p) => sum + p.netPay, 0);
    const totalTax = payslips.reduce(
      (sum, p) => sum + (p.incomeTax + p.socialSecurityTax),
      0,
    );
    const totalInsurance = payslips.reduce(
      (sum, p) => sum + p.healthInsurance,
      0,
    );
    const totalPension = payslips.reduce(
      (sum, p) => sum + p.pensionContribution,
      0,
    );

    // Group by month
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const monthPayslips = payslips.filter(
        (p) => p.payPeriodStart.getMonth() === i,
      );
      return {
        month: i + 1,
        monthName: new Date(year, i).toLocaleString('default', {
          month: 'long',
        }),
        totalGross: monthPayslips.reduce((sum, p) => sum + p.grossPay, 0),
        totalNet: monthPayslips.reduce((sum, p) => sum + p.netPay, 0),
        employeeCount: monthPayslips.length,
      };
    });

    const report = new this.reportModel({
      reportType: ReportType.YEAR_END_SUMMARY,
      title: `Year-End Report - ${year}`,
      description: `Annual payroll summary for ${year}`,
      generatedBy: userId,
      year,
      startDate,
      endDate,
      status: ReportStatus.COMPLETED,
      data: {
        monthlyBreakdown: monthlyData,
        totalPayslips: payslips.length,
      },
      summary: {
        totalEmployees: new Set(
          payslips.map((p) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const empData = p.employeeId as any;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            return empData._id.toString() as string;
          }),
        ).size,
        totalGrossPay,
        totalDeductions,
        totalNetPay,
        totalTax,
        totalInsurance,
        totalBenefits: totalPension,
      },
    });

    return report.save();
  }

  // Generate Tax Report
  async generateTaxReport(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Report> {
    const payslips = await this.payslipModel
      .find({
        payPeriodStart: { $gte: startDate },
        payPeriodEnd: { $lte: endDate },
      })
      .populate('employeeId', 'firstName lastName employeeId department');

    const totalIncomeTax = payslips.reduce((sum, p) => sum + p.incomeTax, 0);
    const totalSocialSecurity = payslips.reduce(
      (sum, p) => sum + p.socialSecurityTax,
      0,
    );
    const totalTax = totalIncomeTax + totalSocialSecurity;

    // Group by employee for individual tax breakdown
    const employeeTaxData = payslips.reduce<Record<string, EmployeeTaxData>>(
      (acc, payslip) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const employeeData = payslip.employeeId as any;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        const empId: string = employeeData._id.toString();
        if (!acc[empId]) {
          acc[empId] = {
            employee: payslip.employeeId,
            totalIncomeTax: 0,
            totalSocialSecurity: 0,
            totalTax: 0,
          };
        }
        acc[empId].totalIncomeTax += payslip.incomeTax;
        acc[empId].totalSocialSecurity += payslip.socialSecurityTax;
        acc[empId].totalTax += payslip.incomeTax + payslip.socialSecurityTax;
        return acc;
      },
      {},
    );

    const report = new this.reportModel({
      reportType: ReportType.TAX_REPORT,
      title: 'Tax Compliance Report',
      description: `Tax summary from ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
      generatedBy: userId,
      startDate,
      endDate,
      status: ReportStatus.COMPLETED,
      data: {
        employeeTaxBreakdown: Object.values(employeeTaxData),
        totalIncomeTax,
        totalSocialSecurity,
      },
      summary: {
        totalTax,
        totalEmployees: Object.keys(employeeTaxData).length,
      },
    });

    return report.save();
  }

  // Generate Insurance Report
  async generateInsuranceReport(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Report> {
    const payslips = await this.payslipModel
      .find({
        payPeriodStart: { $gte: startDate },
        payPeriodEnd: { $lte: endDate },
      })
      .populate('employeeId', 'firstName lastName employeeId department');

    const totalHealthInsurance = payslips.reduce(
      (sum, p) => sum + p.healthInsurance,
      0,
    );
    const totalPension = payslips.reduce(
      (sum, p) => sum + p.pensionContribution,
      0,
    );

    const report = new this.reportModel({
      reportType: ReportType.INSURANCE_REPORT,
      title: 'Insurance & Benefits Report',
      description: `Insurance contributions from ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
      generatedBy: userId,
      startDate,
      endDate,
      status: ReportStatus.COMPLETED,
      data: {
        totalHealthInsurance,
        totalPension,
        employeeCount: payslips.length,
      },
      summary: {
        totalInsurance: totalHealthInsurance + totalPension,
        totalEmployees: new Set(
          payslips.map((p) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const empData = p.employeeId as any;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            return empData._id.toString() as string;
          }),
        ).size,
      },
    });

    return report.save();
  }

  // Find all reports with filters
  async findAll(
    query: ReportQueryDto,
  ): Promise<{ reports: Report[]; total: number }> {
    const filter: Record<string, unknown> = {};

    if (query.reportType) filter.reportType = query.reportType;
    if (query.department) filter.department = query.department;
    if (query.year) filter.year = query.year;

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      this.reportModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('generatedBy', 'firstName lastName employeeId'),
      this.reportModel.countDocuments(filter),
    ]);

    return { reports, total };
  }

  // Find report by ID
  async findById(id: string): Promise<Report> {
    const report = await this.reportModel
      .findById(id)
      .populate('generatedBy', 'firstName lastName employeeId');

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return report;
  }

  // Delete report
  async delete(id: string): Promise<void> {
    const result = await this.reportModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Report not found');
    }
  }
}
