import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
  NotFoundException,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { PayslipService } from '../services/payslip.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import type { RequestWithUser } from '../interfaces/auth.interface';
import * as fs from 'fs';
import * as path from 'path';

@Controller('api/payslips')
@UseGuards(JwtAuthGuard)
export class PayslipController {
  constructor(private readonly payslipService: PayslipService) {}

  private getEmployeeId(req: RequestWithUser): string {
    const id = req.user.employee._id;
    if (!id) {
      throw new NotFoundException('Employee ID not found');
    }
    return id.toString();
  }

  @Get()
  async getPayslips(
    @Request() req: RequestWithUser,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const employeeId = this.getEmployeeId(req);
    const result = await this.payslipService.findByEmployeeId(
      employeeId,
      Number(page),
      Number(limit),
    );

    return {
      success: true,
      data: {
        payslips: result.payslips,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: result.total,
          totalPages: Math.ceil(result.total / Number(limit)),
        },
      },
    };
  }

  @Get('year/:year')
  async getPayslipsByYear(
    @Request() req: RequestWithUser,
    @Param('year') year: number,
  ) {
    const employeeId = this.getEmployeeId(req);
    const payslips = await this.payslipService.getYearlyPayslips(
      employeeId,
      Number(year),
    );

    return {
      success: true,
      data: payslips,
    };
  }

  @Get(':id')
  async getPayslipDetails(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
  ) {
    const payslip = await this.payslipService.findById(id);
    const employeeId = this.getEmployeeId(req);

    // Verify ownership
    if (payslip.employeeId.toString() !== employeeId) {
      throw new NotFoundException('Payslip not found');
    }

    return {
      success: true,
      data: payslip,
    };
  }

  @Get(':id/download')
  async downloadPayslip(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const payslip = await this.payslipService.findById(id);
    const employeeId = this.getEmployeeId(req);

    // Verify ownership
    if (payslip.employeeId.toString() !== employeeId) {
      throw new NotFoundException('Payslip not found');
    }

    if (!payslip.payslipDocument) {
      throw new NotFoundException('Payslip document not available');
    }

    // Assuming files are stored locally in 'uploads' folder
    const filePath = path.join(process.cwd(), payslip.payslipDocument);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Payslip document file not found');
    }

    const payslipId = (payslip as unknown as { _id: string })._id;
    res.download(filePath, `payslip-${payslipId}.pdf`);
  }

  @Get(':id/tax-document')
  async downloadTaxDocument(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const payslip = await this.payslipService.findById(id);
    const employeeId = this.getEmployeeId(req);

    // Verify ownership
    if (payslip.employeeId.toString() !== employeeId) {
      throw new NotFoundException('Payslip not found');
    }

    if (!payslip.taxDocument) {
      throw new NotFoundException('Tax document not available');
    }

    // Assuming files are stored locally in 'uploads' folder
    const filePath = path.join(process.cwd(), payslip.taxDocument);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Tax document file not found');
    }

    const payslipId = (payslip as unknown as { _id: string })._id;
    res.download(filePath, `tax-document-${payslipId}.pdf`);
  }
}
