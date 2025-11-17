import type { Request } from 'express';
import type { Document, Types } from 'mongoose';

export interface JwtPayload {
  sub: string;
  email: string;
  employeeId: string;
}

export interface EmployeeInRequest {
  _id: Types.ObjectId;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  hireDate: Date;
  isActive: boolean;
  phoneNumber?: string;
  address?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
    employeeId: string;
    employee: EmployeeInRequest & Document;
  };
}
