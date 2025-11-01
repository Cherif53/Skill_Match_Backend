import { IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../../users/user.entity';

export class UpdateUserRoleDto {
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
