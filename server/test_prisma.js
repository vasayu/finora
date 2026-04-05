const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Testing Prisma Queries:");
  try {
    const audits = await prisma.auditTrail.findMany({ take: 5 });
    console.log("AuditTrails:", audits.length);
  } catch(e) { console.error("AuditTrails error:", e) }

  try {
    const alerts = await prisma.alert.findMany({ take: 5 });
    console.log("Alerts:", alerts.length);
  } catch(e) { console.error("Alerts error:", e) }

  try {
    const docs = await prisma.document.findMany({ take: 5 });
    console.log("Documents:", docs.length);
  } catch(e) { console.error("Documents error:", e) }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
