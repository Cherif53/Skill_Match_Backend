import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../users/user.entity';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { JwtAuthGuard } from './guards/jwt.guard';


const cookieOpts = {
  httpOnly: true,
  secure: false,         // true en prod (https)
  sameSite: 'lax' as const,
  path: '/',
};

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) { }

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, user, refreshToken } = await this.auth.register(dto, UserRole.STUDENT);
    res.cookie('refreshToken', refreshToken, cookieOpts);
    return { accessToken, user };
  }

  @Post('register-company')
  async registerCompany(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, user, refreshToken } = await this.auth.register(dto, UserRole.COMPANY);
    res.cookie('refreshToken', refreshToken, cookieOpts);
    return { accessToken, user };
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.login(dto);
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: false, // true en prod HTTPS
      sameSite: 'lax',
      path: '/',
    });
    return { accessToken: result.accessToken, user: result.user };
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    console.log('📥 Cookies reçus côté backend:', req.cookies);
    const user = req.user as any;
    const refreshToken = req.cookies?.refreshToken;

    const result = await this.auth.refreshTokens(user.id, refreshToken);
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
    }); // rotation
    return { accessToken: result.accessToken, user: user };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req.user as any;
    await this.auth.logout(user.id);

    // 🧹 Supprime le cookie côté navigateur
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: false, // true en prod
      sameSite: 'lax',
      path: '/',
    });

    return { message: 'Déconnexion réussie.' };
  }
}
