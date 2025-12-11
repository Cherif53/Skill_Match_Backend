import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterCompanyDto {
  @IsNotEmpty()
  @IsString()
  name: string; // nom du contact ou nom du compte

  @IsNotEmpty()
  @IsString()
  companyName: string; // raison sociale

  @IsNotEmpty()
  @IsString()
  siret: string;

  @IsNotEmpty()
  @IsString()
  iban: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
