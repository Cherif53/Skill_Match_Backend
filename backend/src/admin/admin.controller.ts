import { Controller, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { ReviewDocumentDto } from './dto/review-document.dto';
import { DocumentStatus } from 'src/documents/document.entity';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  @Get('users')
  findAllUsers(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search?: string,
  ) {
    return this.adminService.findAllUsers(Number(page), Number(limit), search);
  }


  @Patch('users/:id/toggle')
  toggleUser(@Param('id') id: number) {
    return this.adminService.toggleUserActive(id);
  }

  @Patch('documents/:id/review')
  reviewDoc(@Param('id') id: number, @Body() dto: ReviewDocumentDto) {
    return this.adminService.reviewDocument(id, dto);
  }

  @Patch('users/:id/toggle-active')
  toggleUserActive(@Param('id') id: string) {
    return this.adminService.toggleUserActive(Number(id));
  }

  @Patch('users/:id/role')
  updateUserRole(
    @Param('id') id: string,
    @Body('role') role: UserRole | string,
  ) {
    return this.adminService.updateUserRole(Number(id), role as UserRole);
  }

  @Get('stats')
  async getStats() {
    return this.adminService.getStats();
  }

  @Get('activity')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getActivity() {
    return this.adminService.getActivityStats();
  }


  @Get('documents')
  findAllDocuments(
    @Query('status') status?: DocumentStatus,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.adminService.findAllDocuments(
      Number(page),
      Number(limit),
      status,
    );
  }

  @Patch('documents/:id/status')
  updateDocumentStatus(
    @Param('id') id: string,
    @Body('status') status: DocumentStatus,
    @Body('comment') comment?: string,
  ) {
    return this.adminService.updateDocumentStatus(
      Number(id),
      status,
      comment || '',
    );
  }
}
