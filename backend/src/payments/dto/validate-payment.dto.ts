import { IsInt, IsOptional, IsDateString, Min } from 'class-validator';

export class ValidatePaymentDto {
  @IsInt()
  @Min(1)
  missionId: number;

  @IsOptional()
  @IsDateString()
  paymentDate?: string;
}
