import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuid } from 'uuid';
import { Document } from './document.entity';
import { DocumentStatus, DocumentType } from './document.enums';
import { PresignDto } from './dto/presign.dto';
import { CreateDocumentDto } from './dto/create-document.dto';

@Injectable()
export class DocumentsService {
  private s3: S3Client;
  private bucket: string;
  private forcePathStyle: boolean;

  constructor(
    @InjectRepository(Document)
    private readonly documentsRepo: Repository<Document>,
  ) {
    this.bucket = process.env.S3_BUCKET!;
    this.forcePathStyle = (process.env.S3_FORCE_PATH_STYLE ?? 'true') === 'true';

    this.s3 = new S3Client({
      region: process.env.S3_REGION || 'eu-west-1',
      endpoint: process.env.S3_ENDPOINT,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_KEY!,
      },
      forcePathStyle: this.forcePathStyle,
    });
  }

  async generatePresignedUrl(userId: number, dto: PresignDto) {
    const safeBase = dto.filename.replace(/[^\w.\-]+/g, '_');
    const key = `${userId}/${dto.type}/${uuid()}_${safeBase}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: dto.contentType,
      ACL: 'private',
    });

    const url = await getSignedUrl(this.s3, command, { expiresIn: 60 * 5 }); // 5 min

    return {
      uploadUrl: url,
      key,
      contentType: dto.contentType,
      // URL publique si MinIO est configuré en public; sinon, on gardera la clé et regénèrera des URL de lecture plus tard.
      publicUrl: this.buildPublicUrl(key),
      expiresIn: 300,
    };
  }

  private buildPublicUrl(key: string) {
    // Si forcePathStyle (MinIO), URL = `${endpoint}/${bucket}/${key}`
    // Sinon (S3 AWS), URL = `https://${bucket}.s3.${region}.amazonaws.com/${key}`
    const endpoint = process.env.S3_ENDPOINT?.replace(/\/$/, '');
    if (this.forcePathStyle && endpoint) {
      return `${endpoint}/${this.bucket}/${key}`;
    }
    const region = process.env.S3_REGION || 'eu-west-1';
    return `https://${this.bucket}.s3.${region}.amazonaws.com/${key}`;
  }

  async createAfterUpload(userId: number, dto: CreateDocumentDto) {
    // on pourrait vérifier l’existence de l’objet S3 si nécessaire (HEAD)
    const doc = this.documentsRepo.create({
      user: { id: userId } as any,
      type: dto.type,
      key: dto.key,
      url: dto.url,
      status: DocumentStatus.PENDING,
    });
    return this.documentsRepo.save(doc);
  }

  async findMyDocuments(userId: number) {
    return this.documentsRepo.find({ where: { user: { id: userId } }, order: { createdAt: 'DESC' } });
  }

  async getByIdForUser(userId: number, id: number) {
    const doc = await this.documentsRepo.findOne({ where: { id, user: { id: userId } } });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }
}
