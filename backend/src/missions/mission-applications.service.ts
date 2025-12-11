import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MissionApplication, ApplicationStatus } from './mission-application.entity';
import { MissionsService } from './missions.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/user.entity';

@Injectable()
export class MissionApplicationsService {
  constructor(
    @InjectRepository(MissionApplication)
    private readonly repo: Repository<MissionApplication>,
    private readonly missionsService: MissionsService,
    private readonly usersService: UsersService,
  ) {}

  // 🧩 Étudiant postule à une mission
  async apply(missionId: number, studentId: number) {
    const mission = await this.missionsService.findOne(missionId);
    if (!mission) throw new NotFoundException('Mission non trouvée');

    const student = await this.usersService.findOne(studentId);
    if (!student || student.role !== UserRole.STUDENT)
      throw new ForbiddenException('Seuls les étudiants peuvent postuler');

    const existing = await this.repo.findOne({
      where: { mission: { id: missionId }, student: { id: studentId } },
    });
    if (existing) throw new BadRequestException('Déjà postulé à cette mission');

    const app = this.repo.create({ mission, student, status: ApplicationStatus.PENDING });
    return this.repo.save(app);
  }

  // 🧩 Entreprise consulte les candidatures
  async findByMission(missionId: number) {
    return this.repo.find({
      where: { mission: { id: missionId } },
      relations: ['student'],
    });
  }

  // 🧩 Entreprise accepte un étudiant
  async accept(missionId: number, studentId: number) {
    const app = await this.repo.findOne({
      where: { mission: { id: missionId }, student: { id: studentId } },
      relations: ['mission', 'student'],
    });
    if (!app) throw new NotFoundException('Candidature non trouvée');

    app.status = ApplicationStatus.ACCEPTED;
    await this.repo.save(app);

    // Ajouter l’étudiant à la mission
    await this.missionsService.assignStudent(missionId, studentId);
    return app;
  }

  // 🧩 Entreprise rejette un étudiant
  async reject(missionId: number, studentId: number) {
    const app = await this.repo.findOne({
      where: { mission: { id: missionId }, student: { id: studentId } },
    });
    if (!app) throw new NotFoundException('Candidature non trouvée');

    app.status = ApplicationStatus.REJECTED;
    return this.repo.save(app);
  }

  // 🧩 Étudiant annule sa candidature
  async cancel(missionId: number, studentId: number) {
    const app = await this.repo.findOne({
      where: { mission: { id: missionId }, student: { id: studentId } },
    });
    if (!app) throw new NotFoundException('Candidature non trouvée');

    return this.repo.remove(app);
  }
}
