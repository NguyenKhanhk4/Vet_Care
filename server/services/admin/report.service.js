const User = require('../../models/User');
const Doctor = require('../../models/Doctor');
const Appointment = require('../../models/Appointment');
const Payment = require('../../models/Payment');
const Service = require('../../models/Service');

/**
 * Report Service - Admin
 * Provides detailed statistics and reports
 */
class AdminReportService {
  /**
   * Get comprehensive reports
   * @param {Object} query - { period: 'week' | 'month' | 'year' }
   * @returns {Object} report data
   */
  static async getReports(query = {}) {
    const period = query.period || 'month';
    const dateRange = this.getDateRange(period);

    const [
      revenue,
      appointmentStats,
      popularServices,
      newUsers,
      topDoctors,
    ] = await Promise.all([
      this.getRevenueReport(dateRange),
      this.getAppointmentReport(dateRange),
      this.getPopularServicesReport(dateRange),
      this.getNewUsersReport(dateRange),
      this.getTopDoctorsReport(dateRange),
    ]);

    return {
      period,
      dateRange,
      revenue,
      appointmentStats,
      popularServices,
      newUsers,
      topDoctors,
    };
  }

  /**
   * Get date range based on period
   */
  static getDateRange(period) {
    const end = new Date();
    const start = new Date();

    switch (period) {
      case 'week':
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start.setMonth(start.getMonth() - 1);
        break;
      case 'year':
        start.setFullYear(start.getFullYear() - 1);
        break;
      default:
        start.setMonth(start.getMonth() - 1);
    }

    return { start, end };
  }

  /**
   * Revenue report
   */
  static async getRevenueReport(dateRange) {
    const payments = await Payment.aggregate([
      {
        $match: {
          status: 'PAID',
          createdAt: { $gte: dateRange.start, $lte: dateRange.end },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalTransactions: { $sum: 1 },
          avgTransaction: { $avg: '$amount' },
        },
      },
    ]);

    // Revenue by payment method
    const byMethod = await Payment.aggregate([
      {
        $match: {
          status: 'PAID',
          createdAt: { $gte: dateRange.start, $lte: dateRange.end },
        },
      },
      {
        $group: {
          _id: '$method',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      summary: payments[0] || { totalRevenue: 0, totalTransactions: 0, avgTransaction: 0 },
      byMethod: byMethod.map((item) => ({
        method: item._id,
        total: item.total,
        count: item.count,
      })),
    };
  }

  /**
   * Appointment statistics report
   */
  static async getAppointmentReport(dateRange) {
    const statusCounts = await Appointment.aggregate([
      {
        $match: {
          createdAt: { $gte: dateRange.start, $lte: dateRange.end },
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const total = statusCounts.reduce((sum, item) => sum + item.count, 0);

    return {
      total,
      byStatus: statusCounts.map((item) => ({
        status: item._id,
        count: item.count,
      })),
    };
  }

  /**
   * Popular services report
   */
  static async getPopularServicesReport(dateRange) {
    const popular = await Appointment.aggregate([
      {
        $match: {
          createdAt: { $gte: dateRange.start, $lte: dateRange.end },
        },
      },
      {
        $group: {
          _id: '$service',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'services',
          localField: '_id',
          foreignField: '_id',
          as: 'service',
        },
      },
      { $unwind: '$service' },
      {
        $project: {
          _id: 0,
          name: '$service.name',
          category: '$service.category',
          price: '$service.price',
          count: 1,
          totalRevenue: 1,
        },
      },
    ]);

    return popular;
  }

  /**
   * New users report
   */
  static async getNewUsersReport(dateRange) {
    const newCustomers = await User.countDocuments({
      role: 'customer',
      createdAt: { $gte: dateRange.start, $lte: dateRange.end },
    });

    const newDoctors = await User.countDocuments({
      role: 'doctor',
      createdAt: { $gte: dateRange.start, $lte: dateRange.end },
    });

    return {
      newCustomers,
      newDoctors,
      total: newCustomers + newDoctors,
    };
  }

  /**
   * Top performing doctors report
   */
  static async getTopDoctorsReport(dateRange) {
    const topDoctors = await Appointment.aggregate([
      {
        $match: {
          status: { $in: ['completed', 'paid'] },
          createdAt: { $gte: dateRange.start, $lte: dateRange.end },
        },
      },
      {
        $group: {
          _id: '$doctor',
          appointmentCount: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { appointmentCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'doctors',
          localField: '_id',
          foreignField: '_id',
          as: 'doctor',
        },
      },
      { $unwind: '$doctor' },
      {
        $lookup: {
          from: 'users',
          localField: 'doctor.user',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          doctorName: '$user.name',
          specialization: '$doctor.specialization',
          rating: '$doctor.rating',
          appointmentCount: 1,
          totalRevenue: 1,
        },
      },
    ]);

    return topDoctors;
  }
}

module.exports = AdminReportService;
