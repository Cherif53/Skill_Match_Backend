import { IsString, IsDateString, IsInt } from 'class-validator';

export class CreateMissionDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  location: string;

  @IsDateString()
  date: Date;

  @IsString()
  startHour: string;

  @IsString()
  endHour: string;

  @IsInt()
  studentCount: number;
}
