import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DocumentStatus } from '../../documents/document.entity';

export class ReviewDocumentDto {
  @IsEnum(DocumentStatus)
  status: DocumentStatus;

  @IsOptional()
  @IsString()
  comment?: string;
}
