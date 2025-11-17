import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import 'dotenv/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

// Schemas
import { Employee, EmployeeSchema } from './schemas/employee.schema';
import { Payslip, PayslipSchema } from './schemas/payslip.schema';
import { Dispute, DisputeSchema } from './schemas/dispute.schema';
import {
  ReimbursementClaim,
  ReimbursementClaimSchema,
} from './schemas/reimbursement-claim.schema';
import { Report, ReportSchema } from './schemas/report.schema';

// Services
import { EmployeeService } from './services/employee.service';
import { PayslipService } from './services/payslip.service';
import { DisputeService } from './services/dispute.service';
import { ReimbursementService } from './services/reimbursement.service';
import { ReportService } from './services/report.service';

// Controllers
import { EmployeeController } from './controllers/employee.controller';
import { PayslipController } from './controllers/payslip.controller';
import { DisputeController } from './controllers/dispute.controller';
import { ReimbursementController } from './controllers/reimbursement.controller';
import { ReportController } from './controllers/report.controller';

// Guards & Strategy
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtStrategy } from './guards/jwt.strategy';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://localhost:27017/payroll-system',
    ),
    MongooseModule.forFeature([
      { name: Employee.name, schema: EmployeeSchema },
      { name: Payslip.name, schema: PayslipSchema },
      { name: Dispute.name, schema: DisputeSchema },
      { name: ReimbursementClaim.name, schema: ReimbursementClaimSchema },
      { name: Report.name, schema: ReportSchema },
    ]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [
    AppController,
    EmployeeController,
    PayslipController,
    DisputeController,
    ReimbursementController,
    ReportController,
  ],
  providers: [
    AppService,
    EmployeeService,
    PayslipService,
    DisputeService,
    ReimbursementService,
    ReportService,
    JwtAuthGuard,
    JwtStrategy,
    RolesGuard,
  ],
})
export class AppModule {}
