import { Body, Controller, ForbiddenException, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response, Request, CookieOptions } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../users/user.entity';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { JwtAuthGuard } from './guards/jwt.guard';
import { JwtService } from '@nestjs/jwt';
import { RegisterCompanyDto } from './dto/register-company.dto';
import { RegisterStudentDto } from './dto/register-student.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService, private readonly jwt: JwtService,) { }

  private getCookieOptions(req: Request): CookieOptions {
    const isLocalhost =
      req.hostname === 'localhost' ||
      req.hostname === '127.0.0.1';

    return {
      httpOnly: true,
      secure: false, // ✅ HTTPS uniquement pour *.local
      sameSite: 'lax',
      path: '/',
    } as const;
  }

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response, @Req() req: Request) {
    const { accessToken, user, refreshToken } = await this.auth.register(dto, UserRole.STUDENT);
    res.cookie('skillmatch_refreshToken', refreshToken, this.getCookieOptions(req));
    return { accessToken, user };
  }

  @Post('register-company')
  async registerCompany(@Body() dto: RegisterCompanyDto) {
    return this.auth.registerCompany(dto);
  }

  @Post('register-student')
  async registerStudent(@Body() dto: RegisterStudentDto) {
    return this.auth.registerStudent(dto);
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto, 
    @Req() req: Request, 
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.login(dto);
    res.cookie(
      'skillmatch_refreshToken', 
      result.refreshToken, 
      {
      httpOnly: true,
      sameSite: 'lax',          // en dev: OK
      secure: false,            // ⚠️ surtout pas true en http://localhost
      path: '/',                // pour qu'il parte aussi sur /auth/refresh
      // domain: 'localhost',   // à éviter si tu n’es pas sûr
    },
    );
    return { 
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    console.log('🍪 Cookies reçus:', req.cookies);
    const refreshToken = req.cookies['skillmatch_refreshToken'];
    if (!refreshToken) {
      console.warn('❌ Aucun cookie skillmatch_refreshToken reçu');
      throw new ForbiddenException('Refresh token manquant');
    }

    const payload = this.jwt.verify(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET,
    });
    console.log('✅ Payload décodé:', payload);

    const result = await this.auth.refreshTokens(payload.sub, refreshToken);

    // rotation du cookie
    res.cookie('skillmatch_refreshToken', result.refreshToken, this.getCookieOptions(req));
    return { accessToken: result.accessToken, user: result.user };
  }


  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req.user as any;
    await this.auth.logout(user.id);
    res.clearCookie('skillmatch_refreshToken', this.getCookieOptions(req));
    return { message: 'Déconnexion réussie.' };
  }
}
