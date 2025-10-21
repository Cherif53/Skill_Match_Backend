import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { DocumentType } from '../document.enums';

export class PresignDto {
  @IsEnum(DocumentType)
  type: DocumentType;

  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsString()
  @IsNotEmpty()
  contentType: string;
}
