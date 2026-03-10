import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/user.entity';
import { Document, DocumentStatus } from '../documents/document.entity';
import { ReviewDocumentDto } from './dto/review-document.dto';
import { CreateUserByAdminDto } from './dto/create-user-by-admin.dto';
import * as bcrypt from 'bcryptjs';
import { Mission, MissionStatus } from '../missions/mission.entity';
import { Transaction, TransactionStatus } from 'src/payments/entities/transaction.entity';


@Injectable()
export class AdminService {
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Document)
    private readonly docRepo: Repository<Document>,
    @InjectRepository(Mission)
    private readonly missionRepo: Repository<Mission>,
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
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

  async createUserByAdmin(dto: CreateUserByAdminDto) {
    const existingUser = await this.userRepo.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Un utilisateur avec cet email existe déjà.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = this.userRepo.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      password: hashedPassword,
      role: dto.role,
      isActive: true,
      mustChangePassword: true, // Force le changement de mot de passe à la première connexion
    });

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

    const pendingDocs = await this.docRepo.count({
      where: { status: DocumentStatus.PENDING },
    });

    const approvedDocs = await this.docRepo.count({
      where: { status: DocumentStatus.APPROVED },
    });

    const totalStudents = await this.userRepo.count({
      where: { role: UserRole.STUDENT },
    });

    const totalCompanies = await this.userRepo.count({
      where: { role: UserRole.COMPANY },
    });

    const totalAdmins = await this.userRepo.count({
      where: { role: UserRole.ADMIN },
    });

    const activeStudents = await this.userRepo.count({
      where: {
        role: UserRole.STUDENT,
        isActive: true,
      },
    });

    const missionsOpen = await this.missionRepo.count({
      where: [
        { status: MissionStatus.PENDING },
        { status: MissionStatus.STAFFED },
      ],
    });

    const missionsToStaff = await this.missionRepo
      .createQueryBuilder('mission')
      .where('mission.status = :status', { status: MissionStatus.PENDING })
      .getCount();

    const pendingPayments = await this.transactionRepo.count({
      where: { status: TransactionStatus.PENDING },
    });

    return {
      totalUsers,
      totalDocs,
      pendingDocs,
      approvedDocs,
      totalStudents,
      totalCompanies,
      totalAdmins,
      activeStudents,
      missionsOpen,
      missionsToStaff,
      pendingPayments,
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
      approved: 0,
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
    if (anyRejected) {
      doc.user.isActive = false;
    }
    await this.userRepo.save(doc.user);
    return doc;
  }
}
