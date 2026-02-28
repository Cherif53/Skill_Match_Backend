import { User } from './users/user.entity';
import { UserRole } from './users/user.entity';
import { hash } from 'bcryptjs';
import { AppDataSource } from './database/data-source';

async function seed() {
  await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(User);
  const existingAdmin = await userRepo.findOne({ where: { email: 'admin@skillmatch.dev' } });

  if (existingAdmin) {
    console.log('✅ Admin already exists.');
    await AppDataSource.destroy();
    return;
  }

  const password = await hash('admin123', 10);

  const admin = userRepo.create({
    email: 'admin@skillmatch.dev',
    password,
    role: UserRole.ADMIN,
    isActive: true,
  });

  await userRepo.save(admin);
  console.log('🎉 Admin user created:', admin.email);

  await AppDataSource.destroy();
}

seed().catch((e) => console.error(e));
