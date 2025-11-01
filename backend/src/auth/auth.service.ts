import { Injectable, BadRequestException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { User, UserRole } from '../users/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) { }

  private async signAccessToken(user: User) {
    const payload = { sub: user.id, role: user.role, email: user.email };
    return this.jwt.signAsync(payload, {
      secret: this.config.get<string>('JWT_SECRET'),
      expiresIn: this.config.get<string>('JWT_EXPIRES_IN', '15m'),
    });
  }

  private async signRefreshToken(user: User) {
    const payload = { sub: user.id, tokenType: 'refresh' };
    return this.jwt.signAsync(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });
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
    const user = await this.users.findByEmail(dto.email);

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const match = await bcrypt.compare(dto.password, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    if (!user.isActive) throw new ForbiddenException('Compte en attente de validation.');

    await this.users.update(user.id, { lastLogin: new Date() });

    const at = await this.signAccessToken(user);
    const rt = await this.signRefreshToken(user);
    await this.updateRefreshTokenHash(user.id, rt);

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

}
