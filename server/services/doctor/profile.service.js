const User = require('../../models/User');
const Doctor = require('../../models/Doctor');

class DoctorProfileService {
  static async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('Không tìm thấy người dùng');
      error.statusCode = 404;
      throw error;
    }

    const doctor = await Doctor.findOne({ user: userId }).populate('clinic', 'name address phone');
    if (!doctor) {
      const error = new Error('Không tìm thấy hồ sơ bác sĩ');
      error.statusCode = 404;
      throw error;
    }

    return { user, doctor };
  }

  static async updateProfile(userId, updateData) {
    const { name, phone, address, specialization, experience, bio, avatar } = updateData;

    const userUpdates = {};
    if (name !== undefined) userUpdates.name = name;
    if (phone !== undefined) userUpdates.phone = phone;
    if (address !== undefined) userUpdates.address = address;
    if (avatar !== undefined) userUpdates.avatar = avatar;

    const user = await User.findByIdAndUpdate(userId, userUpdates, {
      new: true,
      runValidators: true,
    });

    const doctorUpdates = {};
    if (specialization !== undefined) doctorUpdates.specialization = specialization;
    if (experience !== undefined) doctorUpdates.experience = experience;
    if (bio !== undefined) doctorUpdates.bio = bio;
    if (avatar !== undefined) doctorUpdates.avatar = avatar;

    const doctor = await Doctor.findOneAndUpdate({ user: userId }, doctorUpdates, {
      new: true,
      runValidators: true,
    }).populate('clinic', 'name address phone');

    return { user, doctor };
  }

  static async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      const error = new Error('Không tìm thấy người dùng');
      error.statusCode = 404;
      throw error;
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      const error = new Error('Mật khẩu hiện tại không đúng');
      error.statusCode = 400;
      throw error;
    }

    user.password = newPassword;
    await user.save();
  }
}

module.exports = DoctorProfileService;
