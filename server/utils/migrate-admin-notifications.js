require('dotenv').config();

const mongoose = require('mongoose');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Appointment = require('../models/Appointment');
const Payment = require('../models/Payment');

async function getActor(notification) {
  if (!notification.relatedId) return notification.user;

  if (notification.type === 'payment') {
    const payment = await Payment.findById(notification.relatedId).select('user').lean();
    return payment?.user || notification.user;
  }

  const appointment = await Appointment.findById(notification.relatedId).select('customer').lean();
  return appointment?.customer || notification.user;
}

async function migrateAdminNotifications() {
  await mongoose.connect(process.env.MONGODB_URI);

  const [admins, legacyNotifications] = await Promise.all([
    User.find({ role: 'admin', isActive: true }).select('_id').lean(),
    Notification.find({ audience: { $ne: 'admin' } }).lean(),
  ]);

  let migrated = 0;
  for (const notification of legacyNotifications) {
    const actor = await getActor(notification);
    for (const admin of admins) {
      const existing = await Notification.exists({
        user: admin._id,
        sourceNotification: notification._id,
      });

      if (!existing) {
        await Notification.create({
          user: admin._id,
          actor,
          audience: 'admin',
          title: notification.title,
          message: notification.message,
          type: notification.type,
          relatedId: notification.relatedId,
          sourceNotification: notification._id,
          createdAt: notification.createdAt,
          updatedAt: notification.updatedAt,
        });
        migrated += 1;
      }
    }
  }

  console.log(`Migrated ${migrated} admin notifications.`);
  await mongoose.disconnect();
}

migrateAdminNotifications().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
