import { IsNumber } from 'class-validator';

export class AssignMissionDto {
  @IsNumber()
  studentId: number;
}
