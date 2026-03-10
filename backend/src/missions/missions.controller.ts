import { Controller, Post, Body, Param, Get, ParseIntPipe, Req, UseGuards, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { MissionsService } from './missions.service';
import { CreateMissionDto } from '../auth/dto/create-mission.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('missions')
export class MissionsController {
  constructor(private readonly missionsService: MissionsService) { }

  // ✅ Créer une mission pour une entreprise
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('COMPANY')
  @Post(':companyId')
  createMission(@Param('companyId', ParseIntPipe) companyId: number, @Body() dto: CreateMissionDto) {
    return this.missionsService.createMission(companyId, dto);
  }

  // ✅ Récupérer les missions d'une entreprise
  @Get('company/:companyId')
  findByCompany(@Param('companyId', ParseIntPipe) companyId: number) {
    return this.missionsService.findByCompany(companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.missionsService.findOne(+id);
  }

  @Get()
  findAll() {
    return this.missionsService.findAll();
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
      throw new UnauthorizedException('Impossible de déterminer l’utilisateur (id manquant dans le token)');
    }

    return this.missionsService.applyToMission(missionId, userId);
  }

}
