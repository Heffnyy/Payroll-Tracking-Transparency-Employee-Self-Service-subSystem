import type { Request } from 'express';
import type { Document, Types } from 'mongoose';
import { EmployeeRole } from '../schemas/employee.schema';

export interface JwtPayload {
  sub: string;
  email: string;
  employeeId: string;
  role: EmployeeRole;
}

export interface EmployeeInRequest {
  _id: Types.ObjectId;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: EmployeeRole;
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
    role: EmployeeRole;
    employee: EmployeeInRequest & Document;
  };
}
