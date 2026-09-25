/**
 * Database Seeder: Entry Point
 *
 * Usage:
 *   npm run seed          - Run all seeders
 *   npm run seed:admin    - Seed admin user only
 *
 * This script connects to MongoDB, runs all registered seeders
 * in sequence, then disconnects.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const seedAdmin = require('./adminSeeder');

const seeders = [
  { name: 'Admin User', fn: seedAdmin },
  // Add more seeders here as needed, e.g.:
  // { name: 'Sample Properties', fn: require('./propertySeeder') },
];

/**
 * Strip credentials from a connection string before it is logged:
 * everything between the leading "//" and the "@" is replaced with "***",
 * so an Atlas URI cannot leak a password into CI output or a log drain.
 */
const redactUri = (uri) => {
  if (!uri) return '(MONGODB_URI not set)';
  return uri.replace(/\/\/[^/@]*@/, '//***@');
};

const runSeeders = async () => {
  try {
    console.log('\n🌱 Database Seeder: Starting\n');
    console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Database    : ${redactUri(process.env.MONGODB_URI)}\n`);

    await connectDB();

    // Allow running a specific seeder via CLI arg
    const target = process.argv[2]; // e.g. "admin"

    for (const seeder of seeders) {
      const key = seeder.name.toLowerCase().replace(/\s+/g, '-');
      if (target && key !== target) continue;

      console.log(`━━ ${seeder.name} ━━`);
      await seeder.fn();
      console.log('');
    }

    console.log('🎉 Seeding complete!\n');
  } catch (err) {
    console.error('\n💥 Seeding failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database disconnected\n');
  }
};

runSeeders();
