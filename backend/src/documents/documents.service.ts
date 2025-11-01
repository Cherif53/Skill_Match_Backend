import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document, DocumentStatus } from './document.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepo: Repository<Document>,
    private readonly usersService: UsersService,
  ) {}

  async create(userId: number, dto: CreateDocumentDto) {
    const user = await this.usersService.findOne(userId);
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    const doc = this.documentRepo.create({
      ...dto,
      user,
      status: DocumentStatus.PENDING,
    });

    return this.documentRepo.save(doc);
  }

  async findByUser(userId: number) {
    return this.documentRepo.find({ where: { user: { id: userId } } });
  }

  async remove(id: number) {
    const doc = await this.documentRepo.findOne({ where: { id } });
    if (!doc) throw new NotFoundException('Document non trouvé');
    await this.documentRepo.remove(doc);
    return { message: 'Document supprimé' };
  }
}
