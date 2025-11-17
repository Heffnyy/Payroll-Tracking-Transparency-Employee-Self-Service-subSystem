import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { ReimbursementService } from '../services/reimbursement.service';
import type { CreateReimbursementClaimDto } from '../dto/reimbursement-claim.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import type { RequestWithUser } from '../interfaces/auth.interface';

@Controller('api/reimbursements')
@UseGuards(JwtAuthGuard)
export class ReimbursementController {
  constructor(private readonly reimbursementService: ReimbursementService) {}

  private getEmployeeId(req: RequestWithUser): string {
    const id = req.user.employee._id;
    if (!id) {
      throw new NotFoundException('Employee ID not found');
    }
    return id.toString();
  }

  @Post()
  async createClaim(
    @Request() req: RequestWithUser,
    @Body() createClaimDto: CreateReimbursementClaimDto,
  ) {
    const employeeId = this.getEmployeeId(req);
    const claim = await this.reimbursementService.create(
      employeeId,
      createClaimDto,
    );

    return {
      success: true,
      message: 'Reimbursement claim submitted successfully',
      data: claim,
    };
  }

  @Get()
  async getClaims(@Request() req: RequestWithUser) {
    const employeeId = this.getEmployeeId(req);
    const claims = await this.reimbursementService.findByEmployeeId(employeeId);

    return {
      success: true,
      data: claims,
    };
  }

  @Get(':id')
  async getClaimDetails(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
  ) {
    const claim = await this.reimbursementService.findById(id);
    const employeeId = this.getEmployeeId(req);

    // Verify ownership
    if (claim.employeeId.toString() !== employeeId) {
      throw new NotFoundException('Reimbursement claim not found');
    }

    return {
      success: true,
      data: claim,
    };
  }

  @Get(':id/status')
  async getClaimStatus(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
  ) {
    const claim = await this.reimbursementService.findById(id);
    const employeeId = this.getEmployeeId(req);

    // Verify ownership
    if (claim.employeeId.toString() !== employeeId) {
      throw new NotFoundException('Reimbursement claim not found');
    }

    return {
      success: true,
      data: {
        status: claim.status,
        submittedAt: claim.createdAt,
        reviewedAt: claim.reviewedAt,
        reviewedBy: claim.reviewedBy,
        adminResponse: claim.adminResponse,
        paymentDate: claim.paymentDate,
        rejectionReason: claim.rejectionReason,
      },
    };
  }
}
