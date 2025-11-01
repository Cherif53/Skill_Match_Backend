import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from './document.entity';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { S3Service } from '../auth/s3.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Document]), UsersModule],
  providers: [DocumentsService, S3Service],
  controllers: [DocumentsController],
})
export class DocumentsModule {}
