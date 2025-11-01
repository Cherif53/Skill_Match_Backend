import { Body, Controller, Delete, Get, Post, Req, UseGuards } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Request } from 'express';


@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: Request, @Body() dto: CreateDocumentDto) {
    const user = req.user as any;
    return this.documentsService.create(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async findMine(@Req() req: Request) {
    const user = req.user as any;
    return this.documentsService.findByUser(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Req() req: Request) {
    const user = req.user as any;
    return this.documentsService.remove(user.id);
  }
}
