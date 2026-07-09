const User = require('../../models/User');
const Doctor = require('../../models/Doctor');
const Pet = require('../../models/Pet');
const Clinic = require('../../models/Clinic');
const Service = require('../../models/Service');
const Appointment = require('../../models/Appointment');
const Payment = require('../../models/Payment');
const Review = require('../../models/Review');

/**
 * Dashboard Service - Admin
 * Provides aggregated statistics for the admin dashboard
 */
class AdminDashboardService {
  /**
   * Get all dashboard statistics
   * @returns {Object} - Dashboard data with counts, revenue, and charts
   */
  static async getDashboardStats() {
    // Run all count queries in parallel for performance
    const [
      totalCustomers,
      totalDoctors,
      totalPets,
      totalAppointments,
      totalClinics,
      totalServices,
      totalReviews,
      revenueData,
      monthlyAppointments,
      popularServices,
      recentAppointments,
      appointmentStatusCounts,
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      Doctor.countDocuments({ isActive: true }),
      Pet.countDocuments(),
      Appointment.countDocuments(),
      Clinic.countDocuments({ isActive: true }),
      Service.countDocuments({ isActive: true }),
      Review.countDocuments(),
      this.getRevenueData(),
      this.getMonthlyAppointments(),
      this.getPopularServices(),
      this.getRecentAppointments(),
      this.getAppointmentStatusCounts(),
    ]);

    // Calculate total revenue
    const totalRevenue = revenueData.reduce((sum, item) => sum + item.total, 0);

    return {
      overview: {
        totalCustomers,
        totalDoctors,
        totalPets,
        totalAppointments,
        totalRevenue,
        totalClinics,
        totalServices,
        totalReviews,
      },
      charts: {
        revenueByMonth: revenueData,
        appointmentsByMonth: monthlyAppointments,
        popularServices,
        appointmentStatusCounts,
      },
      recentAppointments,
    };
  }

  /**
   * Get revenue data grouped by month (last 6 months)
   */
  static async getRevenueData() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const revenue = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    return revenue.map((item) => ({
      year: item._id.year,
      month: item._id.month,
      total: item.total,
      count: item.count,
    }));
  }

  /**
   * Get appointment count grouped by month (last 6 months)
   */
  static async getMonthlyAppointments() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const appointments = await Appointment.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    return appointments.map((item) => ({
      year: item._id.year,
      month: item._id.month,
      count: item.count,
    }));
  }

  /**
   * Get top 5 most popular services by booking count
   */
  static async getPopularServices() {
    const popular = await Appointment.aggregate([
      {
        $group: {
          _id: '$service',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
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
          serviceId: '$_id',
          name: '$service.name',
          category: '$service.category',
          price: '$service.price',
          count: 1,
        },
      },
    ]);

    return popular;
  }

  /**
   * Get 10 most recent appointments
   */
  static async getRecentAppointments() {
    const appointments = await Appointment.find()
      .populate('customer', 'name email phone')
      .populate('pet', 'name species breed')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name' },
      })
      .populate('clinic', 'name')
      .populate('service', 'name price')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return appointments;
  }

  /**
   * Get appointment counts grouped by status
   */
  static async getAppointmentStatusCounts() {
    const statusCounts = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {};
    statusCounts.forEach((item) => {
      result[item._id] = item.count;
    });

    return result;
  }
}

module.exports = AdminDashboardService;
