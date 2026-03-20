import { Injectable, ConflictException, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'; 
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';
import { ChangePasswordDto } from '../payments/dto/change-password.dto';

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
    const allowedData = { 
      companyName: data.companyName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      website: data.website,
      description: data.description,
    }; // Seules ces propriétés peuvent être mises à jour
    await this.repo.update(id, allowedData);
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

  async changePassword(userId: number, dto: ChangePasswordDto) {
  const user = await this.repo.findOne({ where: { id: userId } });

  if (!user) {
    throw new NotFoundException('Utilisateur introuvable');
  }

  const isMatch = await bcrypt.compare(dto.currentPassword, user.password);

  if (!isMatch) {
    throw new UnauthorizedException('Mot de passe actuel incorrect');
  }

  const samePassword = await bcrypt.compare(dto.newPassword, user.password);
  if (samePassword) {
    throw new BadRequestException('Le nouveau mot de passe doit être différent de l’ancien');
  }

  user.password = await bcrypt.hash(dto.newPassword, 10);
  user.mustChangePassword = false;

  await this.repo.save(user);

  return { message: 'Mot de passe mis à jour avec succès' };
}
}
