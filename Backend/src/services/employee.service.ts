import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Employee, EmployeeDocument } from '../schemas/employee.schema';
import {
  CreateEmployeeDto,
  LoginEmployeeDto,
  UpdateEmployeeDto,
} from '../dto/employee.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
    private jwtService: JwtService,
  ) {}

  async create(
    createEmployeeDto: CreateEmployeeDto,
  ): Promise<EmployeeDocument> {
    const hashedPassword = await bcrypt.hash(createEmployeeDto.password, 10);
    const employee = new this.employeeModel({
      ...createEmployeeDto,
      password: hashedPassword,
    });
    return employee.save();
  }

  async login(
    loginEmployeeDto: LoginEmployeeDto,
  ): Promise<{ employee: Omit<Employee, 'password'>; token: string }> {
    const employee = await this.employeeModel.findOne({
      email: loginEmployeeDto.email,
    });

    if (!employee) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginEmployeeDto.password,
      employee.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: employee._id,
      email: employee.email,
      employeeId: employee.employeeId,
    };
    const token = this.jwtService.sign(payload);

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...employeeWithoutPassword } = employee.toObject();

    return {
      employee: employeeWithoutPassword,
      token,
    };
  }

  async findById(id: string): Promise<Employee> {
    const employee = await this.employeeModel.findById(id).select('-password');
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    return employee;
  }

  async findByEmployeeId(employeeId: string): Promise<Employee> {
    const employee = await this.employeeModel
      .findOne({ employeeId })
      .select('-password');
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    return employee;
  }

  async update(
    id: string,
    updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<Employee> {
    const employee = await this.employeeModel
      .findByIdAndUpdate(id, updateEmployeeDto, { new: true })
      .select('-password');

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    return employee;
  }

  async findAll(): Promise<Employee[]> {
    return this.employeeModel.find({ isActive: true }).select('-password');
  }
}
