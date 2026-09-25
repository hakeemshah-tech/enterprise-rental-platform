/**
 * Admin User Seeder
 * Seeds the database with a default admin user.
 * Skips creation if an admin with the same email already exists.
 */

const User = require('../models/User');

/**
 * Local-development credentials only. Override both values via the
 * environment before seeding any shared or production database.
 */
const ADMIN_USER = {
  name: 'Admin',
  email: process.env.SEED_ADMIN_EMAIL || 'admin@example.com',
  password: process.env.SEED_ADMIN_PASSWORD || 'ChangeMe@123',
  role: 'admin',
  phone: '+971 50 000 0001',
};

const seedAdmin = async () => {
  try {
    const existing = await User.findOne({ email: ADMIN_USER.email });
    if (existing) {
      console.log(`  ⏭  Admin user already exists (${ADMIN_USER.email}), skipping`);
      return existing;
    }

    const admin = await User.create(ADMIN_USER);
    console.log(`  ✅ Admin user created: ${admin.email} (role: ${admin.role})`);
    return admin;
  } catch (err) {
    console.error('  ❌ Admin seeder failed:', err.message);
    throw err;
  }
};

module.exports = seedAdmin;
