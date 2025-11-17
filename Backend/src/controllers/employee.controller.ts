import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EmployeeService } from '../services/employee.service';
import type {
  CreateEmployeeDto,
  LoginEmployeeDto,
  UpdateEmployeeDto,
} from '../dto/employee.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import type { RequestWithUser } from '../interfaces/auth.interface';

@Controller('api')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post('auth/register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createEmployeeDto: CreateEmployeeDto) {
    const employee = await this.employeeService.create(createEmployeeDto);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = employee.toObject() as Record<
      string,
      unknown
    >;
    return {
      success: true,
      message: 'Employee registered successfully',
      data: result,
    };
  }

  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginEmployeeDto: LoginEmployeeDto) {
    const result = await this.employeeService.login(loginEmployeeDto);
    return {
      success: true,
      message: 'Login successful',
      data: {
        employee: result.employee,
        token: result.token,
      },
    };
  }

  @Get('employees/me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: RequestWithUser) {
    const employee = await this.employeeService.findById(req.user.userId);
    return {
      success: true,
      data: employee,
    };
  }

  @Put('employees/me')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Request() req: RequestWithUser,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    const employee = await this.employeeService.update(
      req.user.userId,
      updateEmployeeDto,
    );
    return {
      success: true,
      message: 'Profile updated successfully',
      data: employee,
    };
  }
}
