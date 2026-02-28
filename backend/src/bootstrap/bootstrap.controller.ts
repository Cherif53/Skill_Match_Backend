// src/bootstrap/bootstrap.controller.ts
import { Body, Controller, ForbiddenException, Post } from "@nestjs/common";
import { DataSource } from "typeorm";
import * as bcrypt from "bcrypt";
import { UserRole } from "../users/user.entity"; // adapte le chemin si besoin

@Controller("bootstrap")
export class BootstrapController {
  constructor(private readonly dataSource: DataSource) {}

  @Post("admin")
  async bootstrapAdmin(@Body() body: { key: string }) {
    // 1) sécurité : clé obligatoire
    if (!body?.key || body.key !== process.env.BOOTSTRAP_KEY) {
      throw new ForbiddenException("Invalid key");
    }

    const email = process.env.BOOTSTRAP_ADMIN_EMAIL;
    const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;

    if (!email || !password) {
      throw new ForbiddenException("Missing BOOTSTRAP_ADMIN_EMAIL/PASSWORD");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // 2) on cherche l'user existant
    const existing = await this.dataSource.query(
      `SELECT id FROM "user" WHERE email = $1 LIMIT 1`,
      [email]
    );

    // 3) s’il existe -> update password + role ADMIN + isActive true
    if (existing?.length) {
      await this.dataSource.query(
        `UPDATE "user"
         SET password = $1, role = $2, "isActive" = true
         WHERE email = $3`,
        [passwordHash, UserRole.ADMIN, email]
      );
      return { ok: true, message: "Admin updated" };
    }

    // 4) sinon -> create (adapte les colonnes selon ton entity user)
    await this.dataSource.query(
      `INSERT INTO "user"(email, password, role, "isActive", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, true, NOW(), NOW())`,
      [email, passwordHash, UserRole.ADMIN]
    );

    return { ok: true, message: "Admin created" };
  }
}