import { Controller, Get, Patch, Param, UseGuards, Req, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ChangePasswordDto } from 'src/payments/dto/change-password.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private users: UsersService) {}

  @Get(':id')
  me(@Param('id') id: string) {
    return this.users.findById(Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMe(@Req() req: Request, @Body() body: any) {
    const user = (req as any).user;
    return this.users.update(user.id, body);
  }
  
  @Patch('change-password')
  changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    return this.users.changePassword(req.user.id, dto);
  }

}
