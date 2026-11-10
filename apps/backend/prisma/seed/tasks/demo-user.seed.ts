import { User } from '@oitenta/auth';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const DEMO_NAME = 'Usuária Demo';

// Idempotente: se o e-mail demo já existe, não faz nada.
export async function seedDemoUser(prisma: PrismaClient): Promise<void> {
  const email = process.env.DEMO_EMAIL?.trim().toLowerCase();
  const password = process.env.DEMO_PASSWORD;
  if (!email || !password) {
    throw new Error(
      'DEMO_EMAIL e DEMO_PASSWORD são obrigatórios para o seed do usuário demo.',
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`[seed] usuário demo já existe (${email}), nada a fazer.`);
    return;
  }

  const user = new User({
    name: DEMO_NAME,
    email,
    password: await hash(password, 12),
  });
  user.validate();

  await prisma.user.create({
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: null,
    },
  });
  console.log(`[seed] usuário demo criado (${email}).`);
}
