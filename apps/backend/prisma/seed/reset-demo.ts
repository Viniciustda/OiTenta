import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// Só para desenvolvimento e testes de ponta a ponta: apaga os dados do usuário demo
// (sessões, blocos, objetivos, etapas e disponibilidade) e mantém o usuário. Assim o
// fluxo "login demo → onboarding" começa sempre do zero.
async function main() {
  const url = process.env.DATABASE_URL;
  const email = process.env.DEMO_EMAIL?.trim().toLowerCase();
  if (!url || !email) {
    throw new Error('DATABASE_URL e DEMO_EMAIL são obrigatórios.');
  }
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: url }),
  });
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log(
        `[reset-demo] usuário demo (${email}) não existe; rode o seed.`,
      );
      return;
    }
    const userId = user.id;
    await prisma.$transaction([
      prisma.focusSession.deleteMany({ where: { userId } }),
      prisma.scheduledBlock.deleteMany({ where: { userId } }),
      prisma.goal.deleteMany({ where: { userId } }),
      prisma.weeklyAvailability.deleteMany({ where: { userId } }),
    ]);
    console.log(`[reset-demo] dados do usuário demo apagados (${email}).`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
