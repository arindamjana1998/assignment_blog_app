import bcrypt from 'bcryptjs';
import connectDB, { disconnectDB } from '../config/db.js';
import User from '../models/user.model.js';
import { ROLES } from '../constants/roles.js';

const seedAdmin = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await connectDB();

    const adminEmail = process.env.ADMIN_SEED_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_SEED_PASSWORD || 'AdminPassword123!';
    const adminName = process.env.ADMIN_SEED_NAME || 'System Administrator';

    let admin = await User.findOne({ email: adminEmail });

    if (admin) {
      console.log(`[Seed] User with email ${adminEmail} already exists. Ensuring admin role...`);
      admin.role = ROLES.ADMIN;
      admin.isActive = true;
      await admin.save();
      console.log('[Seed] Admin role confirmed successfully.');
    } else {
      console.log(`[Seed] Creating new administrator account: ${adminEmail}`);
      const passwordHash = await bcrypt.hash(adminPassword, 12);

      admin = await User.create({
        name: adminName,
        email: adminEmail,
        passwordHash,
        role: ROLES.ADMIN,
        isActive: true,
        oauthProvider: {
          provider: 'local',
          providerId: null,
        },
      });

      console.log('=======================================================');
      console.log('✅ Administrator account created successfully:');
      console.log(`👤 Name:     ${adminName}`);
      console.log(`📧 Email:    ${adminEmail}`);
      console.log(`🔑 Password: ${adminPassword}`);
      console.log('⚠️  Please change this password in production!');
      console.log('=======================================================');
    }

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error(`[Seed] Error seeding admin account: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
