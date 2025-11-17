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
import { DisputeService } from '../services/dispute.service';
import type { CreateDisputeDto } from '../dto/dispute.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import type { RequestWithUser } from '../interfaces/auth.interface';

@Controller('api/disputes')
@UseGuards(JwtAuthGuard)
export class DisputeController {
  constructor(private readonly disputeService: DisputeService) {}

  private getEmployeeId(req: RequestWithUser): string {
    const id = req.user.employee._id;
    if (!id) {
      throw new NotFoundException('Employee ID not found');
    }
    return id.toString();
  }

  @Post()
  async createDispute(
    @Request() req: RequestWithUser,
    @Body() createDisputeDto: CreateDisputeDto,
  ) {
    const employeeId = this.getEmployeeId(req);
    const dispute = await this.disputeService.create(
      employeeId,
      createDisputeDto,
    );

    return {
      success: true,
      message: 'Dispute submitted successfully',
      data: dispute,
    };
  }

  @Get()
  async getDisputes(@Request() req: RequestWithUser) {
    const employeeId = this.getEmployeeId(req);
    const disputes = await this.disputeService.findByEmployeeId(employeeId);

    return {
      success: true,
      data: disputes,
    };
  }

  @Get(':id')
  async getDisputeDetails(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
  ) {
    const dispute = await this.disputeService.findById(id);
    const employeeId = this.getEmployeeId(req);

    // Verify ownership
    if (dispute.employeeId.toString() !== employeeId) {
      throw new NotFoundException('Dispute not found');
    }

    return {
      success: true,
      data: dispute,
    };
  }

  @Get(':id/status')
  async getDisputeStatus(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
  ) {
    const dispute = await this.disputeService.findById(id);
    const employeeId = this.getEmployeeId(req);

    // Verify ownership
    if (dispute.employeeId.toString() !== employeeId) {
      throw new NotFoundException('Dispute not found');
    }

    return {
      success: true,
      data: {
        status: dispute.status,
        submittedAt: dispute.createdAt,
        reviewedAt: dispute.reviewedAt,
        reviewedBy: dispute.reviewedBy,
        resolution: dispute.resolutionNotes,
      },
    };
  }
}
