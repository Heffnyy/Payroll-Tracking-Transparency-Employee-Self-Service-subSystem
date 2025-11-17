/**
 * MongoDB Database Seeding Script for Phase 1
 * 
 * This script seeds the database with sample data:
 * - 3 sample employees
 * - Payslips for each employee
 * - Sample disputes and reimbursement claims
 * 
 * Usage: node seed-db.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/payroll-system';

// Schemas (simplified for seeding)
const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  firstName: String,
  lastName: String,
  email: { type: String, required: true, unique: true },
  password: String,
  department: String,
  position: String,
  role: { type: String, enum: ['EMPLOYEE', 'MANAGER', 'PAYROLL_SPECIALIST', 'FINANCE_STAFF', 'ADMIN'], default: 'EMPLOYEE' },
  hireDate: Date,
  isActive: { type: Boolean, default: true },
  phoneNumber: String,
  address: String,
}, { timestamps: true });

const payslipSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  payPeriodStart: Date,
  payPeriodEnd: Date,
  payDate: Date,
  baseSalary: Number,
  overtime: { type: Number, default: 0 },
  bonus: { type: Number, default: 0 },
  leaveCompensation: { type: Number, default: 0 },
  transportationAllowance: { type: Number, default: 0 },
  otherAllowances: { type: Number, default: 0 },
  grossPay: Number,
  incomeTax: Number,
  socialSecurityTax: Number,
  healthInsurance: Number,
  pensionContribution: Number,
  otherDeductions: { type: Number, default: 0 },
  totalDeductions: Number,
  netPay: Number,
  status: { type: String, default: 'processed' },
  payslipDocument: String,
  taxDocument: String,
  isDisputed: { type: Boolean, default: false },
}, { timestamps: true });

const disputeSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  payslipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payslip' },
  subject: String,
  description: String,
  category: String,
  status: { type: String, default: 'submitted' },
  resolution: String,
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  reviewedAt: Date,
}, { timestamps: true });

const reimbursementSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  claimType: String,
  description: String,
  amount: Number,
  expenseDate: Date,
  status: { type: String, default: 'submitted' },
  receipts: [String],
  adminResponse: String,
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  reviewedAt: Date,
  paymentDate: Date,
  rejectionReason: String,
}, { timestamps: true });

const Employee = mongoose.model('Employee', employeeSchema);
const Payslip = mongoose.model('Payslip', payslipSchema);
const Dispute = mongoose.model('Dispute', disputeSchema);
const ReimbursementClaim = mongoose.model('ReimbursementClaim', reimbursementSchema);

// Helper function to calculate dates
function getMonthRange(monthsAgo) {
  const end = new Date();
  end.setMonth(end.getMonth() - monthsAgo);
  end.setDate(0); // Last day of previous month
  
  const start = new Date(end);
  start.setDate(1);
  
  return { start, end };
}

async function seedDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Employee.deleteMany({});
    await Payslip.deleteMany({});
    await Dispute.deleteMany({});
    await ReimbursementClaim.deleteMany({});
    console.log('✅ Cleared existing data');

    // Create employees
    console.log('👥 Creating employees...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const employees = await Employee.create([
      {
        employeeId: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@company.com',
        password: hashedPassword,
        department: 'Engineering',
        position: 'Senior Software Engineer',
        role: 'EMPLOYEE',
        hireDate: new Date('2020-01-15'),
        phoneNumber: '+1234567890',
        address: '123 Main St, City, Country',
      },
      {
        employeeId: 'EMP002',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@company.com',
        password: hashedPassword,
        department: 'Marketing',
        position: 'Marketing Manager',
        role: 'MANAGER',
        hireDate: new Date('2021-03-20'),
        phoneNumber: '+1234567891',
        address: '456 Oak Ave, City, Country',
      },
      {
        employeeId: 'EMP003',
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@company.com',
        password: hashedPassword,
        department: 'Finance',
        position: 'Financial Analyst',
        role: 'EMPLOYEE',
        hireDate: new Date('2022-06-10'),
        phoneNumber: '+1234567892',
        address: '789 Pine Rd, City, Country',
      },
      {
        employeeId: 'EMP004',
        firstName: 'Sarah',
        lastName: 'Williams',
        email: 'sarah.williams@company.com',
        password: hashedPassword,
        department: 'Human Resources',
        position: 'Payroll Specialist',
        role: 'PAYROLL_SPECIALIST',
        hireDate: new Date('2019-08-12'),
        phoneNumber: '+1234567893',
        address: '321 Elm St, City, Country',
      },
      {
        employeeId: 'EMP005',
        firstName: 'David',
        lastName: 'Brown',
        email: 'david.brown@company.com',
        password: hashedPassword,
        department: 'Finance',
        position: 'Finance Manager',
        role: 'FINANCE_STAFF',
        hireDate: new Date('2018-05-03'),
        phoneNumber: '+1234567894',
        address: '654 Maple Dr, City, Country',
      },
      {
        employeeId: 'EMP006',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@company.com',
        password: hashedPassword,
        department: 'Administration',
        position: 'System Administrator',
        role: 'ADMIN',
        hireDate: new Date('2017-01-01'),
        phoneNumber: '+1234567895',
        address: '987 Cedar Ln, City, Country',
      },
    ]);
    console.log(`✅ Created ${employees.length} employees`);

    // Create payslips for last 6 months for each employee
    console.log('💰 Creating payslips...');
    const payslips = [];
    
    for (const employee of employees) {
      const baseSalary = employee.department === 'Engineering' ? 8000 : 
                        employee.department === 'Marketing' ? 6500 : 5500;
      
      for (let i = 0; i < 6; i++) {
        const { start, end } = getMonthRange(i);
        const payDate = new Date(end);
        payDate.setDate(payDate.getDate() + 5); // Pay 5 days after period ends
        
        const overtime = Math.floor(Math.random() * 500);
        const bonus = i === 0 ? Math.floor(Math.random() * 2000) : 0;
        const leaveCompensation = Math.floor(Math.random() * 300);
        const transportationAllowance = 200;
        const otherAllowances = Math.floor(Math.random() * 150);
        
        const grossPay = baseSalary + overtime + bonus + leaveCompensation + 
                        transportationAllowance + otherAllowances;
        
        const incomeTax = Math.floor(grossPay * 0.20);
        const socialSecurityTax = Math.floor(grossPay * 0.05);
        const healthInsurance = 150;
        const pensionContribution = Math.floor(grossPay * 0.06);
        
        const totalDeductions = incomeTax + socialSecurityTax + 
                               healthInsurance + pensionContribution;
        const netPay = grossPay - totalDeductions;
        
        payslips.push({
          employeeId: employee._id,
          payPeriodStart: start,
          payPeriodEnd: end,
          payDate,
          baseSalary,
          overtime,
          bonus,
          leaveCompensation,
          transportationAllowance,
          otherAllowances,
          grossPay,
          incomeTax,
          socialSecurityTax,
          healthInsurance,
          pensionContribution,
          totalDeductions,
          netPay,
          status: 'processed',
          payslipDocument: `uploads/payslips/payslip-${employee.employeeId}-${start.getFullYear()}-${start.getMonth() + 1}.pdf`,
          taxDocument: `uploads/tax-documents/tax-${employee.employeeId}-${start.getFullYear()}-${start.getMonth() + 1}.pdf`,
        });
      }
    }
    
    const createdPayslips = await Payslip.create(payslips);
    console.log(`✅ Created ${createdPayslips.length} payslips`);

    // Create sample disputes
    console.log('⚠️  Creating disputes...');
    const disputes = await Dispute.create([
      {
        employeeId: employees[0]._id,
        payslipId: createdPayslips[0]._id,
        subject: 'Incorrect overtime calculation',
        description: 'My overtime hours were 20 but only 15 hours were paid.',
        category: 'calculation_error',
        status: 'submitted',
      },
      {
        employeeId: employees[1]._id,
        payslipId: createdPayslips[6]._id,
        subject: 'Missing transportation allowance',
        description: 'Transportation allowance was not included in this month payslip.',
        category: 'missing_payment',
        status: 'under_review',
      },
    ]);
    console.log(`✅ Created ${disputes.length} disputes`);

    // Create sample reimbursement claims
    console.log('📝 Creating reimbursement claims...');
    const claims = await ReimbursementClaim.create([
      {
        employeeId: employees[0]._id,
        claimType: 'travel',
        description: 'Client meeting travel expenses - Round trip to NYC',
        amount: 450.00,
        expenseDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        status: 'submitted',
        receipts: ['uploads/receipts/receipt-001.pdf'],
      },
      {
        employeeId: employees[1]._id,
        claimType: 'meal',
        description: 'Team dinner with clients',
        amount: 180.00,
        expenseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        status: 'approved',
        receipts: ['uploads/receipts/receipt-002.pdf'],
        adminResponse: 'Approved. Payment will be processed in next payroll cycle.',
      },
      {
        employeeId: employees[2]._id,
        claimType: 'office_supplies',
        description: 'Ergonomic keyboard and mouse',
        amount: 120.00,
        expenseDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        status: 'under_review',
        receipts: ['uploads/receipts/receipt-003.pdf'],
      },
    ]);
    console.log(`✅ Created ${claims.length} reimbursement claims`);

    console.log('\n🎉 Database seeding completed successfully!\n');
    console.log('📋 Summary:');
    console.log(`   - Employees: ${employees.length}`);
    console.log(`   - Payslips: ${createdPayslips.length}`);
    console.log(`   - Disputes: ${disputes.length}`);
    console.log(`   - Reimbursement Claims: ${claims.length}`);
    console.log('\n👤 Test Login Credentials:');
    console.log('   Regular Employee:');
    console.log('     Email: john.doe@company.com');
    console.log('     Password: password123');
    console.log('     Role: EMPLOYEE');
    console.log('\n   Manager:');
    console.log('     Email: jane.smith@company.com');
    console.log('     Password: password123');
    console.log('     Role: MANAGER');
    console.log('\n   Payroll Specialist:');
    console.log('     Email: sarah.williams@company.com');
    console.log('     Password: password123');
    console.log('     Role: PAYROLL_SPECIALIST');
    console.log('\n   Finance Staff:');
    console.log('     Email: david.brown@company.com');
    console.log('     Password: password123');
    console.log('     Role: FINANCE_STAFF');
    console.log('\n   Admin:');
    console.log('     Email: admin@company.com');
    console.log('     Password: password123');
    console.log('     Role: ADMIN\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the seed function
seedDatabase();
