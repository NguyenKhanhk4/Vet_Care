require('dotenv').config();

const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Payment = require('../models/Payment');
const AdminDashboardService = require('../services/admin/dashboard.service');
const AdminReportService = require('../services/admin/report.service');

const TEST_PREFIX = '[TEST-REVENUE]';
const paymentsToCreate = [
  { amount: 150000, date: new Date('2026-07-03T09:00:00+07:00') },
  { amount: 200000, date: new Date('2026-07-05T10:00:00+07:00') },
  { amount: 300000, date: new Date('2026-07-07T11:00:00+07:00') },
  { amount: 450000, date: new Date('2026-07-09T15:00:00+07:00') },
];

async function seedTestPayments() {
  await mongoose.connect(process.env.MONGODB_URI);

  const template = await Appointment.findOne({ status: { $ne: 'cancelled' } }).lean();
  if (!template) {
    throw new Error('Cannot create test payments because no valid appointment exists.');
  }

  const createdPayments = [];

  for (let index = 0; index < paymentsToCreate.length; index += 1) {
    const { amount, date } = paymentsToCreate[index];
    const sequence = index + 1;
    const description = `${TEST_PREFIX} Payment ${sequence}`;
    const orderCode = 990000001 + index;

    let appointment = await Appointment.findOne({ notes: `${TEST_PREFIX} Appointment ${sequence}` });

    if (!appointment) {
      appointment = await Appointment.create({
        customer: template.customer,
        pet: template.pet,
        clinic: template.clinic,
        doctor: template.doctor,
        service: template.service,
        date,
        time: `${8 + index}:30`,
        status: 'confirmed',
        paymentStatus: 'PAID',
        totalAmount: amount,
        notes: `${TEST_PREFIX} Appointment ${sequence}`,
        createdAt: date,
        updatedAt: date,
      });
    }

    const payment = await Payment.findOneAndUpdate(
      { orderCode },
      {
        $set: {
          appointment: appointment._id,
          user: template.customer,
          amount,
          description,
          status: 'PAID',
          transactionId: `TEST-TXN-${sequence}`,
          paidAt: date,
          createdAt: date,
          updatedAt: date,
        },
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    createdPayments.push(payment);
  }

  const summary = await Payment.aggregate([
    { $match: { description: { $in: paymentsToCreate.map((_, index) => `${TEST_PREFIX} Payment ${index + 1}`) }, status: 'PAID' } },
    { $group: { _id: null, transactions: { $sum: 1 }, revenue: { $sum: '$amount' } } },
  ]);
  const dashboard = await AdminDashboardService.getDashboardStats();
  const report = await AdminReportService.getReports({ period: 'month' });

  console.log(JSON.stringify({
    createdOrUpdated: createdPayments.map((payment) => ({
      orderCode: payment.orderCode,
      amount: payment.amount,
      status: payment.status,
    })),
    revenueCheck: summary[0] || { transactions: 0, revenue: 0 },
    dashboardRevenue: dashboard.overview.totalRevenue,
    revenueByMonth: dashboard.charts.revenueByMonth,
    monthlyReportRevenue: report.revenue.summary,
  }, null, 2));

  await mongoose.disconnect();
}

seedTestPayments().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
