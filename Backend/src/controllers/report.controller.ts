import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReportService } from '../services/report.service';
import { GenerateReportDto, ReportQueryDto } from '../dto/report.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { EmployeeRole } from '../schemas/employee.schema';
import type { RequestWithUser } from '../interfaces/auth.interface';

@Controller('api/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  // Generate Department Summary Report
  @Post('department')
  @Roles(
    EmployeeRole.PAYROLL_SPECIALIST,
    EmployeeRole.FINANCE_STAFF,
    EmployeeRole.ADMIN,
  )
  @HttpCode(HttpStatus.CREATED)
  async generateDepartmentReport(
    @Request() req: RequestWithUser,
    @Body() dto: GenerateReportDto,
  ) {
    if (!dto.department || !dto.startDate || !dto.endDate) {
      return {
        success: false,
        message: 'Department, startDate, and endDate are required',
      };
    }

    const report = await this.reportService.generateDepartmentReport(
      req.user.userId,
      dto.department,
      new Date(dto.startDate),
      new Date(dto.endDate),
    );

    return {
      success: true,
      message: 'Department report generated successfully',
      data: report,
    };
  }

  // Generate Month-End Summary Report
  @Post('month-end')
  @Roles(
    EmployeeRole.PAYROLL_SPECIALIST,
    EmployeeRole.FINANCE_STAFF,
    EmployeeRole.ADMIN,
  )
  @HttpCode(HttpStatus.CREATED)
  async generateMonthEndReport(
    @Request() req: RequestWithUser,
    @Body() dto: GenerateReportDto,
  ) {
    if (!dto.year || !dto.month) {
      return {
        success: false,
        message: 'Year and month are required',
      };
    }

    const report = await this.reportService.generateMonthEndReport(
      req.user.userId,
      dto.year,
      dto.month,
    );

    return {
      success: true,
      message: 'Month-end report generated successfully',
      data: report,
    };
  }

  // Generate Year-End Summary Report
  @Post('year-end')
  @Roles(EmployeeRole.FINANCE_STAFF, EmployeeRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async generateYearEndReport(
    @Request() req: RequestWithUser,
    @Body() dto: GenerateReportDto,
  ) {
    if (!dto.year) {
      return {
        success: false,
        message: 'Year is required',
      };
    }

    const report = await this.reportService.generateYearEndReport(
      req.user.userId,
      dto.year,
    );

    return {
      success: true,
      message: 'Year-end report generated successfully',
      data: report,
    };
  }

  // Generate Tax Report
  @Post('tax')
  @Roles(
    EmployeeRole.PAYROLL_SPECIALIST,
    EmployeeRole.FINANCE_STAFF,
    EmployeeRole.ADMIN,
  )
  @HttpCode(HttpStatus.CREATED)
  async generateTaxReport(
    @Request() req: RequestWithUser,
    @Body() dto: GenerateReportDto,
  ) {
    if (!dto.startDate || !dto.endDate) {
      return {
        success: false,
        message: 'Start date and end date are required',
      };
    }

    const report = await this.reportService.generateTaxReport(
      req.user.userId,
      new Date(dto.startDate),
      new Date(dto.endDate),
    );

    return {
      success: true,
      message: 'Tax report generated successfully',
      data: report,
    };
  }

  // Generate Insurance Report
  @Post('insurance')
  @Roles(
    EmployeeRole.PAYROLL_SPECIALIST,
    EmployeeRole.FINANCE_STAFF,
    EmployeeRole.ADMIN,
  )
  @HttpCode(HttpStatus.CREATED)
  async generateInsuranceReport(
    @Request() req: RequestWithUser,
    @Body() dto: GenerateReportDto,
  ) {
    if (!dto.startDate || !dto.endDate) {
      return {
        success: false,
        message: 'Start date and end date are required',
      };
    }

    const report = await this.reportService.generateInsuranceReport(
      req.user.userId,
      new Date(dto.startDate),
      new Date(dto.endDate),
    );

    return {
      success: true,
      message: 'Insurance report generated successfully',
      data: report,
    };
  }

  // Get All Reports (with filters)
  @Get()
  @Roles(
    EmployeeRole.PAYROLL_SPECIALIST,
    EmployeeRole.FINANCE_STAFF,
    EmployeeRole.ADMIN,
  )
  async getAllReports(@Query() query: ReportQueryDto) {
    const result = await this.reportService.findAll(query);

    return {
      success: true,
      data: {
        reports: result.reports,
        pagination: {
          page: query.page || 1,
          limit: query.limit || 10,
          total: result.total,
          totalPages: Math.ceil(result.total / (query.limit || 10)),
        },
      },
    };
  }

  // Get Specific Report by ID
  @Get(':id')
  @Roles(
    EmployeeRole.PAYROLL_SPECIALIST,
    EmployeeRole.FINANCE_STAFF,
    EmployeeRole.ADMIN,
  )
  async getReportById(@Param('id') id: string) {
    const report = await this.reportService.findById(id);

    return {
      success: true,
      data: report,
    };
  }

  // Delete Report
  @Delete(':id')
  @Roles(EmployeeRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteReport(@Param('id') id: string) {
    await this.reportService.delete(id);
  }
}
