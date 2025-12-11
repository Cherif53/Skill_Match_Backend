import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { MissionsService } from './missions.service';
import { AssignMissionDto } from '../auth/dto/assign-mission.dto';
import { UpdateMissionDto } from '../auth/dto/update-mission.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('admin/missions')
export class AdminMissionsController {
  constructor(private readonly missionsService: MissionsService) { }

  // ✅ Voir toutes les missions
  @Get()
  async getAll() {
    return this.missionsService.findAll();
  }

  // ✅ Assigner un étudiant à une mission
  @Patch(':id/assign')
  async assignStudent(@Param('id') id: number, @Body() dto: AssignMissionDto) {
    return this.missionsService.assignStudent(id, dto.studentId);
  }

  // ✅ Désassigner un étudiant
  @Patch(':id/unassign')
  async unassignStudent(@Param('id') id: number, @Body() dto: AssignMissionDto) {
    return this.missionsService.unassignStudent(id, dto.studentId);
  }

  // ✅ Mettre à jour le statut d'une mission (STAFFED, COMPLETED, CANCELLED)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: number,
    @Body() dto: UpdateMissionDto,
  ) {
    return this.missionsService.updateMissionStatus(id, dto.status!);
  }

  // ✅ Valider le paiement d'une mission
  @Patch(':id/validate-payment')
  async validatePayment(@Param('id') id: number) {
    return this.missionsService.validateMissionPayment(id);
  }

  // ✅ Supprimer une mission
  @Delete(':id')
  async deleteMission(@Param('id') id: number) {
    return this.missionsService.deleteMission(id);
  }

  @Get(':id/applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getApplications(@Param('id', ParseIntPipe) missionId: number) {
    return this.missionsService.getApplicationsForMission(missionId);
  }

  @Patch(':id/staff')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async staffMission(
    @Param('id', ParseIntPipe) missionId: number,
    @Body('applicationIds') applicationIds: number[],
  ) {
    return this.missionsService.staffMission(missionId, applicationIds);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async findAll() {
    return this.missionsService.getAdminMissions();
  }
}
