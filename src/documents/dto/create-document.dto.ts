import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { DocumentType } from '../document.enums';

export class CreateDocumentDto {
  @IsEnum(DocumentType)
  type: DocumentType;

  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsNotEmpty()
  url: string;
}
