import {
  Controller,
  Post,
  Delete,
  Param,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { MissionApplicationsService } from './mission-applications.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/user.entity';
import { Request } from 'express';

@Controller('missions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MissionApplicationsController {
  constructor(private readonly apps: MissionApplicationsService) {}

  // 👩‍🎓 Étudiant postule
  @Roles(UserRole.STUDENT)
  @Post(':id/apply')
  async apply(@Param('id') id: number, @Req() req: Request) {
    const user = req.user as any;
    return this.apps.apply(id, user.id);
  }

  // 👩‍🎓 Étudiant annule
  @Roles(UserRole.STUDENT)
  @Delete(':id/cancel')
  async cancel(@Param('id') id: number, @Req() req: Request) {
    const user = req.user as any;
    return this.apps.cancel(id, user.id);
  }

  // 🏢 Entreprise consulte les candidatures
  @Roles(UserRole.COMPANY)
  @Get(':id/applicants')
  async findByMission(@Param('id') id: number) {
    return this.apps.findByMission(id);
  }

  // 🏢 Entreprise accepte un étudiant
  @Roles(UserRole.COMPANY)
  @Post(':id/accept/:studentId')
  async accept(@Param('id') id: number, @Param('studentId') studentId: number) {
    return this.apps.accept(id, studentId);
  }

  // 🏢 Entreprise rejette un étudiant
  @Roles(UserRole.COMPANY)
  @Post(':id/reject/:studentId')
  async reject(@Param('id') id: number, @Param('studentId') studentId: number) {
    return this.apps.reject(id, studentId);
  }
}
