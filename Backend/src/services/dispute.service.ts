import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Dispute, DisputeDocument } from '../schemas/dispute.schema';
import { CreateDisputeDto, UpdateDisputeStatusDto } from '../dto/dispute.dto';

@Injectable()
export class DisputeService {
  constructor(
    @InjectModel(Dispute.name) private disputeModel: Model<DisputeDocument>,
  ) {}

  async create(
    employeeId: string,
    createDisputeDto: CreateDisputeDto,
  ): Promise<Dispute> {
    const dispute = new this.disputeModel({
      ...createDisputeDto,
      employeeId,
    });
    return dispute.save();
  }

  async findByEmployeeId(employeeId: string): Promise<Dispute[]> {
    return this.disputeModel
      .find({ employeeId })
      .sort({ createdAt: -1 })
      .populate('payslipId')
      .populate('reviewedBy', 'firstName lastName employeeId');
  }

  async findById(id: string): Promise<Dispute> {
    const dispute = await this.disputeModel
      .findById(id)
      .populate('employeeId', 'firstName lastName employeeId')
      .populate('payslipId')
      .populate('reviewedBy', 'firstName lastName employeeId');

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }
    return dispute;
  }

  async updateStatus(
    id: string,
    status: string,
    adminId: string,
    updateDto: UpdateDisputeStatusDto,
  ): Promise<Dispute> {
    const dispute = await this.disputeModel.findByIdAndUpdate(
      id,
      {
        status,
        ...updateDto,
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
      { new: true },
    );

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }
    return dispute;
  }

  async findAll(): Promise<Dispute[]> {
    return this.disputeModel
      .find()
      .sort({ createdAt: -1 })
      .populate('employeeId', 'firstName lastName employeeId')
      .populate('payslipId')
      .populate('reviewedBy', 'firstName lastName employeeId');
  }

  async checkOwnership(
    disputeId: string,
    employeeId: string,
  ): Promise<boolean> {
    const dispute = await this.disputeModel.findById(disputeId);
    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }
    return dispute.employeeId.toString() === employeeId;
  }
}
