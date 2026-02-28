import { Injectable, BadRequestException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtSignOptions, JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { User, UserRole } from '../users/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterCompanyDto } from './dto/register-company.dto';
import { RegisterStudentDto } from './dto/register-student.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) { }

  private async signAccessToken(user: User) {
    const payload = { sub: user.id, role: user.role, email: user.email };

    const options: JwtSignOptions = {
      secret: this.config.get<string>('JWT_SECRET') ?? '',
      expiresIn: 60 * 15, // 15 minutes
    };

    // ✅ le cast force la bonne surcharge à être utilisée
    return this.jwt.signAsync(payload as any, options);
  }

  private async signRefreshToken(user: User) {
    const payload = { sub: user.id, tokenType: 'refresh' };

    const options: JwtSignOptions = {
      secret: this.config.get<string>('JWT_REFRESH_SECRET') ?? '',
      expiresIn: 60 * 60 * 24 * 7, // 7 jours
    };

    return this.jwt.signAsync(payload as any, options);
  }

  private async hash(data: string) {
    return bcrypt.hash(data, 10);
  }

  private async updateRefreshTokenHash(userId: number, rt: string) {
    const hash = await this.hash(rt);
    await this.users.update(userId, { refreshTokenHash: hash });
  }

  async register(dto: RegisterDto, role: UserRole = UserRole.STUDENT) {
    const exists = await this.users.findByEmail(dto.email);
    if (exists) throw new BadRequestException('Email already exists');

    const password = await bcrypt.hash(dto.password, 10);
    const user = await this.users.create({ ...dto, password, role, isActive: role === UserRole.COMPANY });

    const at = await this.signAccessToken(user);
    const rt = await this.signRefreshToken(user);
    await this.updateRefreshTokenHash(user.id, rt);

    return { accessToken: at, user, refreshToken: rt }; // rt sera mis en cookie httpOnly au controller
  }

  async login(dto: LoginDto) {
    console.log('🟡 Tentative de login avec', dto.email);
    const user = await this.users.findByEmail(dto.email);
    console.log('👤 Utilisateur trouvé :', user ? user.email : 'aucun');

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const match = await bcrypt.compare(dto.password, user.password);
    console.log('🔐 Password match =', match);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    await this.users.update(user.id, { lastLogin: new Date() });

    const at = await this.signAccessToken(user);
    const rt = await this.signRefreshToken(user);
    await this.updateRefreshTokenHash(user.id, rt);

    console.log('✅ Login réussi pour', user.email);
    return { accessToken: at, user, refreshToken: rt };
  }

  async logout(userId: number) {
    // 🔒 On supprime le refreshTokenHash dans la base
    await this.users.update(userId, { refreshTokenHash: null });
    return { message: 'Logged out successfully' };
  }

  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.users.findOne(userId);
    if (!user || !user.refreshTokenHash)
      throw new ForbiddenException('Access Denied');

    const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!isValid) throw new ForbiddenException('Invalid refresh token');

    const newAccessToken = await this.signAccessToken(user);
    const newRefreshToken = await this.signRefreshToken(user);
    await this.updateRefreshTokenHash(user.id, newRefreshToken);

    // ✅ on renvoie aussi user
    return { accessToken: newAccessToken, refreshToken: newRefreshToken, user };
  }

  async registerCompany(dto: RegisterCompanyDto) {
    const existing = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new BadRequestException('Email déjà utilisé');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = this.usersRepo.create({
      email: dto.email,
      password: passwordHash,
      role: UserRole.COMPANY,
      firstName: dto.name, // tu peux affiner si tu as des champs séparés
      // tu peux créer une entité CompanyProfile plus tard pour stocker siret/iban
      companyName: dto.companyName,
      siret: dto.siret,
      iban: dto.iban,
      address: dto.address,
      phone: dto.phone,
    });

    await this.usersRepo.save(user);

    // pour l’instant on renvoie juste un message simple
    return { message: 'Compte entreprise créé avec succès' };
  }

  async registerStudent(dto: RegisterStudentDto) {
    const existing = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new BadRequestException('Email déjà utilisé');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = this.usersRepo.create({
      email: dto.email,
      password: passwordHash,
      role: UserRole.STUDENT,
      firstName: dto.firstName,
      lastName: dto.lastName,
      // 🚨 Étudiant toujours inactif à la création
      isActive: false,
    });

    await this.usersRepo.save(user);

    return { message: 'Compte étudiant créé. Veuillez compléter vos documents pour être activé.' };
  }

}
