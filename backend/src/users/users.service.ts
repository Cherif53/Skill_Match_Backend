import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  // ✅ utilisée par AuthService.register()
  async create(data: Partial<User>) {
    const existing = await this.repo.findOne({ where: { email: data.email } });
    if (existing) throw new ConflictException('Email already exists');
    const user = this.repo.create(data);
    return this.repo.save(user);
  }

  // ✅ utilisée par AuthService.login()
  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  // ✅ utilisée par UsersController
  async findById(id: number) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async findAll() {
    return this.repo.find();
  }

  async update(id: number, data: Partial<User>) {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  // ✅ utilisée par AdminService (facultative mais utile)
  async save(user: User) {
    return this.repo.save(user);
  }

  // ✅ pour AdminService ou seed.ts
  async findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }
}
