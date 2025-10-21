import { Body, Controller, Get, Post, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DocumentsService } from './documents.service';
import { PresignDto } from './dto/presign.dto';
import { CreateDocumentDto } from './dto/create-document.dto';

@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('presign')
  async presign(@Req() req, @Body(new ValidationPipe({ whitelist: true })) dto: PresignDto) {
    const userId = req.user.id;
    return this.documentsService.generatePresignedUrl(userId, dto);
  }

  @Post()
  async createAfterUpload(
    @Req() req,
    @Body(new ValidationPipe({ whitelist: true })) dto: CreateDocumentDto,
  ) {
    const userId = req.user.id;
    return this.documentsService.createAfterUpload(userId, dto);
  }

  @Get('me')
  async myDocuments(@Req() req) {
    const userId = req.user.id;
    return this.documentsService.findMyDocuments(userId);
  }
}
