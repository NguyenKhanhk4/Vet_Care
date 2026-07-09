const DoctorProfileService = require('../../services/doctor/profile.service');

class DoctorProfileController {
  static async getProfile(req, res, next) {
    try {
      const result = await DoctorProfileService.getProfile(req.user._id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const result = await DoctorProfileService.updateProfile(req.user._id, req.body);
      res.status(200).json({ success: true, message: 'Cập nhật hồ sơ thành công', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      await DoctorProfileService.changePassword(req.user._id, currentPassword, newPassword);
      res.status(200).json({ success: true, message: 'Đổi mật khẩu thành công' });
    } catch (error) {
      next(error);
    }
  }

  static async uploadAvatar(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Vui lòng tải lên một ảnh' });
      }
      
      const avatarUrl = `/uploads/${req.file.filename}`;
      const result = await DoctorProfileService.updateProfile(req.user._id, { avatar: avatarUrl });
      res.status(200).json({ success: true, message: 'Cập nhật ảnh đại diện thành công', data: result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DoctorProfileController;
