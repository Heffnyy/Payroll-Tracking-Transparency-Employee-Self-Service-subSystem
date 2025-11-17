import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EmployeeDocument = Employee & Document;

@Schema({ timestamps: true })
export class Employee {
  @Prop({ required: true, unique: true })
  employeeId: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  department: string;

  @Prop({ required: true })
  position: string;

  @Prop({ required: true })
  hireDate: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  phoneNumber: string;

  @Prop()
  address: string;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
