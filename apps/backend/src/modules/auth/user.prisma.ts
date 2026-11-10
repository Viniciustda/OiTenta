import { Injectable } from '@nestjs/common';
import { User, UserRepository } from '@oitenta/auth';
import { User as UserRecord } from '@prisma/client';
import { PrismaService } from '../../db/prisma.service';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: User): Promise<User> {
    const created = await this.prisma.user.create({
      data: this.toPersistence(data),
    });
    return this.toDomain(created);
  }

  async findById(id: string): Promise<User | null> {
    const found = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });
    return found ? this.toDomain(found) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const found = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
    });
    return found ? this.toDomain(found) : null;
  }

  private toPersistence(user: User): UserRecord {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt ?? null,
    };
  }

  private toDomain(raw: UserRecord): User {
    return new User({
      id: raw.id,
      name: raw.name,
      email: raw.email,
      password: raw.password,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
    });
  }
}
