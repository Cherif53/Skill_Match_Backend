import { IsEnum, IsOptional } from 'class-validator';
import { MissionStatus } from '../../missions/mission.entity';

export class UpdateMissionDto {
  @IsEnum(MissionStatus)
  @IsOptional()
  status?: MissionStatus;
}
