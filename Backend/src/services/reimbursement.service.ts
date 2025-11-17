import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ReimbursementClaim,
  ReimbursementClaimDocument,
} from '../schemas/reimbursement-claim.schema';
import {
  CreateReimbursementClaimDto,
  UpdateClaimStatusDto,
} from '../dto/reimbursement-claim.dto';

@Injectable()
export class ReimbursementService {
  constructor(
    @InjectModel(ReimbursementClaim.name)
    private claimModel: Model<ReimbursementClaimDocument>,
  ) {}

  async create(
    employeeId: string,
    createClaimDto: CreateReimbursementClaimDto,
  ): Promise<ReimbursementClaim> {
    const claim = new this.claimModel({
      ...createClaimDto,
      employeeId,
    });
    return claim.save();
  }

  async findByEmployeeId(employeeId: string): Promise<ReimbursementClaim[]> {
    return this.claimModel
      .find({ employeeId })
      .sort({ createdAt: -1 })
      .populate('reviewedBy', 'firstName lastName employeeId');
  }

  async findById(id: string): Promise<ReimbursementClaim> {
    const claim = await this.claimModel
      .findById(id)
      .populate('employeeId', 'firstName lastName employeeId')
      .populate('reviewedBy', 'firstName lastName employeeId');

    if (!claim) {
      throw new NotFoundException('Reimbursement claim not found');
    }
    return claim;
  }

  async updateStatus(
    id: string,
    status: string,
    adminId: string,
    updateDto: UpdateClaimStatusDto,
  ): Promise<ReimbursementClaim> {
    const claim = await this.claimModel.findByIdAndUpdate(
      id,
      {
        status,
        ...updateDto,
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
      { new: true },
    );

    if (!claim) {
      throw new NotFoundException('Reimbursement claim not found');
    }
    return claim;
  }

  async findAll(): Promise<ReimbursementClaim[]> {
    return this.claimModel
      .find()
      .sort({ createdAt: -1 })
      .populate('employeeId', 'firstName lastName employeeId')
      .populate('reviewedBy', 'firstName lastName employeeId');
  }

  async checkOwnership(claimId: string, employeeId: string): Promise<boolean> {
    const claim = await this.claimModel.findById(claimId);
    if (!claim) {
      throw new NotFoundException('Claim not found');
    }
    return claim.employeeId.toString() === employeeId;
  }
}
