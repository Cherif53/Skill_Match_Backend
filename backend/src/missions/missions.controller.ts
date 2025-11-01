import { Controller, Get, Post, Param, Body, Delete, Patch } from '@nestjs/common';
import { MissionsService } from './missions.service';
import { CreateMissionDto } from '../auth/dto/create-mission.dto';

@Controller('admin/missions')
export class MissionsController {
  constructor(private readonly missionsService: MissionsService) {}

  @Get()
  findAll() {
    return this.missionsService.findAll();
  }

  @Post(':companyId')
  create(@Param('companyId') companyId: number, @Body() dto: CreateMissionDto) {
    return this.missionsService.createMission(companyId, dto);
  }

  @Patch(':id/assign')
  assignStudent(@Param('id') id: number, @Body('studentEmail') studentEmail: string) {
    return this.missionsService.assignStudentByEmail(id, studentEmail);
  }

  @Patch(':id/unassign')
  unassignStudent(@Param('id') id: number, @Body('studentEmail') studentEmail: string) {
    return this.missionsService.unassignStudentByEmail(id, studentEmail);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: number, @Body('status') status: string) {
    return this.missionsService.updateStatus(id, status as any);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.missionsService.deleteMission(id);
  }
}
