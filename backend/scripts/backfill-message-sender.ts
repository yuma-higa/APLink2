import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Find messages missing sender field (Mongo documents created before the enum existed)
  const messages = await prisma.message.findMany({});
  let updated = 0;

  for (const m of messages as any[]) {
    if (!m.sender) {
      // Heuristic: template messages sent by recruiters
      const isCompanyTemplate = typeof m.content === 'string' && /we'd like to connect!/i.test(m.content);
      const inferred = isCompanyTemplate ? 'COMPANY' : 'STUDENT';
      await prisma.message.update({ where: { id: m.id }, data: { sender: inferred } as any });
      updated++;
    }
  }

  console.log(`Backfill complete. Updated ${updated} messages.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
