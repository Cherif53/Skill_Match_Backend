import { IsNotEmpty, IsString, IsUrl, IsEnum } from 'class-validator';
import { DocumentType } from '../document.entity';


export class CreateDocumentDto { 

    @IsEnum(DocumentType)
    @IsNotEmpty()
    type: DocumentType;

    @IsString() 
    @IsNotEmpty() 
    name: string; 

    @IsUrl() 
    url: string; }