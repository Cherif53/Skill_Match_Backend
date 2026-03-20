import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  ParseIntPipe,
  Req,
  UseGuards,
  UnauthorizedException,
  ForbiddenException,
  Patch,
  Delete,
} from '@nestjs/common';
import { MissionsService } from './missions.service';
import { CreateMissionDto } from '../auth/dto/create-mission.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/users/user.entity';
import { MissionStatus } from './mission.entity';

@Controller('missions')
export class MissionsController {
  constructor(private readonly missionsService: MissionsService) { }

  // ✅ Créer une mission pour une entreprise
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY)
  @Post()
  createMission(@Req() req: Request, @Body() dto: CreateMissionDto) {
    const user = (req as any).user;
    return this.missionsService.createMission(user.id, dto);
  }

  // ✅ Récupérer les missions de l'entreprise connectée
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY)
  @Get()
  findAll(@Req() req: Request) {
    const user = (req as any).user;
    return this.missionsService.findAll(user.id);
  }

  // ✅ Récupérer une mission de l'entreprise connectée
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = (req as any).user;
    return this.missionsService.findOne(id, user.id);
  }

  // ✅ Mettre à jour une mission de l'entreprise connectée
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY)
  @Patch(':id')
  async updateMission(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
    @Body()
    body: Partial<{
      title: string;
      description: string;
      location: string;
      date: string;
      startHour: string;
      endHour: string;
      studentCount: number;
      status: MissionStatus;
    }>,
  ) {
    const user = (req as any).user;

    return this.missionsService.update(id, user.id, {
      ...body,
      date: body.date ? new Date(body.date) : undefined,
    });
  }

  // ✅ Supprimer une mission de l'entreprise connectée
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY)
  @Delete(':id')
  async deleteMission(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = (req as any).user;
    return this.missionsService.deleteMission(id, user.id);
  }

  // ✅ Récupérer les missions d'une entreprise spécifique
  // À garder seulement si utile côté admin / interne
  @Get('company/:companyId')
  findByCompany(@Param('companyId', ParseIntPipe) companyId: number) {
    return this.missionsService.findByCompany(companyId);
  }

  @Post(':id/apply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  async applyToMission(
    @Param('id', ParseIntPipe) missionId: number,
    @Req() req: any,
  ) {
    const user = req.user;
    if (!user.isActive) {
      throw new ForbiddenException(
        'Votre compte n’est pas encore validé. Veuillez compléter vos documents.'
      );
    }

    const userId = req.user?.id ?? req.user?.sub;

    console.log('🟡 applyToMission controller', {
      missionId,
      user: req.user,
      userId,
    });

    if (!userId) {
      throw new UnauthorizedException(
        'Impossible de déterminer l’utilisateur (id manquant dans le token)'
      );
    }

    return this.missionsService.applyToMission(missionId, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY)
  @Get(':id/applicants')
  getApplicationsForMission(
    @Param('id', ParseIntPipe) missionId: number,
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    return this.missionsService.getApplicationsForMission(missionId, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY)
  @Post(':id/accept/:studentId')
  acceptApplicant(
    @Param('id', ParseIntPipe) missionId: number,
    @Param('studentId', ParseIntPipe) studentId: number,
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    return this.missionsService.acceptApplicant(missionId, studentId, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY)
  @Post(':id/reject/:studentId')
  rejectApplicant(
    @Param('id', ParseIntPipe) missionId: number,
    @Param('studentId', ParseIntPipe) studentId: number,
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    return this.missionsService.rejectApplicant(missionId, studentId, user.id);
  }
  
}