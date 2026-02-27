import { Body, Controller, ForbiddenException, Post, Req, Res } from '@nestjs/common';
import { Response, Request, CookieOptions } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../users/user.entity';
import { JwtService } from '@nestjs/jwt';
import { RegisterCompanyDto } from './dto/register-company.dto';
import { RegisterStudentDto } from './dto/register-student.dto';
import { Throttle } from "@nestjs/throttler";


@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService, private readonly jwt: JwtService,) { }

  private getCookieOptions(req: Request): CookieOptions {
    const isProd = process.env.NODE_ENV === 'production';
    return {
      httpOnly: true,
      secure: isProd, // ✅ true en prod (https obligatoire)
      sameSite: isProd ? "none" : "lax", // ✅ cross-site en prod
      domain: isProd ? process.env.COOKIE_DOMAIN : undefined, // ".lesindependants.xyz"
      path: "/auth/refresh", // optionnel mais recommandé
      maxAge: 7 * 24 * 60 * 60 * 1000,
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

  @Throttle({ default: { limit: 20, ttl: 60 } })
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const isProd = process.env.NODE_ENV === 'production';
    const result = await this.auth.login(dto);
    res.cookie(
      'skillmatch_refreshToken',
      result.refreshToken,
      {
        httpOnly: true,
        secure: isProd, // ✅ true en prod (https obligatoire)
        sameSite: isProd ? "none" : "lax", // ✅ cross-site en prod
        domain: isProd ? process.env.COOKIE_DOMAIN : undefined, // ".lesindependants.xyz"
        path: "/auth/refresh", // optionnel mais recommandé
        maxAge: 7 * 24 * 60 * 60 * 1000,
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
