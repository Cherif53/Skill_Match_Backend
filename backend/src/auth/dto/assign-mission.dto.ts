import { IsUUID } from 'class-validator';

export class AssignMissionDto {

  @IsUUID()
  missionId: number;

  @IsUUID()
  studentId: number;
}
