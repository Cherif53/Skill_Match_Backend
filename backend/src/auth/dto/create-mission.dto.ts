import { IsString, IsDateString, IsInt, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { MissionStatus } from 'src/missions/mission.entity';

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
// === Champs financiers (optionnels, gérés côté back si absents) ===
  @IsOptional()
  @IsNumber()
  hourlyRate?: number;

  @IsOptional()
  @IsNumber()
  totalStudentEarnings?: number;

  @IsOptional()
  @IsNumber()
  platformCommission?: number;

  @IsOptional()
  @IsNumber()
  totalCompanyCost?: number;

  // === Statut (optionnel, par défaut: PENDING) ===
  @IsOptional()
  @IsEnum(MissionStatus)
  status?: MissionStatus;
}