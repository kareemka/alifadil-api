import { Injectable, OnModuleInit } from '@nestjs/common';
import { UsersService } from './users/users.service';
import { UserRole } from './users/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(private usersService: UsersService) {}

  async onModuleInit() {
    await this.seedAdmin();
  }

  async seedAdmin() {
    const adminEmail = 'admin@gmail.com';
    const adminExists = await this.usersService.findOneByEmail(adminEmail);

    if (!adminExists) {
      console.log('Seeding admin user...');
      const hashedPassword = await bcrypt.hash('adminpassword123', 10);
      await this.usersService.create({
        email: adminEmail,
        password: hashedPassword,
        role: UserRole.ADMIN,
      });
      console.log('Admin user seeded successfully!');
    } else {
      console.log('Admin user already exists.');
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}
