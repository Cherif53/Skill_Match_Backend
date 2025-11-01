import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/user.entity';
import { Document, DocumentStatus } from '../documents/document.entity';
import { PaginationDto } from './dto/pagination.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { ReviewDocumentDto } from './dto/review-document.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Document)
    private readonly docRepo: Repository<Document>,
  ) { }

  // 👥 Liste des utilisateurs avec pagination et recherche
  async findAllUsers(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;
    const qb = this.userRepo.createQueryBuilder('user')
      .orderBy('user.id', 'ASC')
      .skip(skip).take(limit);

    if (search) {
      qb.where('user.email ILIKE :s OR user.firstName ILIKE :s OR user.lastName ILIKE :s', { s: `%${search}%` });
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, meta: { page, limit, total } };
  }


  // 🔄 Modifier le rôle ou l’état actif d’un utilisateur
  async updateUserRole(id: number, role: UserRole) {
    const valid = Object.values(UserRole);
    if (!valid.includes(role)) {
      throw new BadRequestException(`Invalid role. Allowed: ${valid.join(', ')}`);
    }
    const user = await this.usersService.findOne(id);
    if (!user) throw new BadRequestException('User not found');
    user.role = role;
    return this.usersService.save(user);
  }
  async toggleUserActive(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    user.isActive = !user.isActive;
    return this.userRepo.save(user);
  }

  // 📄 Validation ou refus d’un document
  async reviewDocument(id: number, dto: ReviewDocumentDto) {
    const doc = await this.docRepo.findOne({ where: { id }, relations: ['user'] });
    if (!doc) throw new NotFoundException('Document not found');
    doc.status = dto.status;
    return this.docRepo.save(doc);
  }

  // 📊 Statistiques globales
  async getStats() {
    const totalUsers = await this.userRepo.count();
    const totalDocs = await this.docRepo.count();
    const pendingDocs = await this.docRepo.count({ where: { status: DocumentStatus.PENDING } });
    const approvedDocs = await this.docRepo.count({ where: { status: DocumentStatus.APPROVED } });

    const activity = [
      { month: 'Jan', users: 15, documents: 10 },
      { month: 'Fév', users: 30, documents: 20 },
      { month: 'Mar', users: 45, documents: 25 },
      { month: 'Avr', users: 60, documents: 40 },
    ];

    return {
      totalUsers,
      totalDocs,
      pendingDocs,
      approvedDocs,
      activity,
    };
  }

  async getActivityStats() {
    const query = await this.userRepo
      .createQueryBuilder('user')
      .select("TO_CHAR(user.createdAt, 'Mon')", 'month')
      .addSelect('COUNT(*)', 'users')
      .groupBy('month')
      .orderBy('MIN(user.createdAt)', 'ASC')
      .getRawMany();

    return query.map((r) => ({
      month: r.month,
      users: Number(r.users),
      approved: Math.floor(Math.random() * r.users),
    }));
  }


  async findAllDocuments(page = 1, limit = 10, status?: DocumentStatus) {
    const skip = (page - 1) * limit;

    const qb = this.docRepo
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.user', 'user')
      .orderBy('document.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (status) {
      qb.where('document.status = :status', { status });
    }

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: { page, limit, total },
    };
  }

  async updateDocumentStatus(id: number, status: DocumentStatus, comment?: string) {
    const doc = await this.docRepo.findOne({ where: { id }, relations: ['user'] });
    if (!doc) throw new BadRequestException('Document not found');

    doc.status = status;
    if (comment) doc.reviewComment = comment;
    await this.docRepo.save(doc);


    // ✅ Si le document est approuvé, on active automatiquement l’utilisateur
    const allDocs = await this.docRepo.find({ where: { user: { id: doc.user.id } } });
    const allApproved = allDocs.every((d) => d.status === DocumentStatus.APPROVED);
    const anyRejected = allDocs.some((d) => d.status === DocumentStatus.REJECTED);

    if (allApproved && !doc.user.isActive) {
      doc.user.isActive = true;
    }

    // ✅ Si rejeté, on peut désactiver le compte
    if(anyRejected) {
      doc.user.isActive = false;
    }
    await this.docRepo.save(doc);
    return doc;
  }
}
