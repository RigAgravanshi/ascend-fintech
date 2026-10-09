import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('[Ascend Seed] Seeding fictional demo data...');

  const demoEmail = 'demo@ascend-local.test';
  
  // Clean up existing demo user if present
  await prisma.user.deleteMany({
    where: { email: demoEmail },
  });

  const now = new Date();
  const dueDate = new Date();
  dueDate.setDate(now.getDate() + 12); // 12 days left to pay -> green (> 7 days)

  const statementDate = new Date();
  statementDate.setDate(now.getDate() - 18);

  const demoUser = await prisma.user.create({
    data: {
      email: demoEmail,
      profileCompleted: true,
      currentStep: 4,
      dob: '1996-06-15',
      age: 28,
      aadhaarLast4: '4921',
      digilockerVerified: true,
      digilockerRef: 'DL-MOCK-SEED-9812',
      fullName: 'Kabir Sharma',
      phone: '9876543210',
      addressStreet: '42 Crescent Avenue',
      addressCity: 'Bengaluru',
      addressState: 'Karnataka',
      addressPincode: '560001',
      annualIncome: 1450000,
      incomeSource: 'Salaried Professional',
      bankDetailsSaved: true,
      encryptedBankDetails: null, // Will be set on fresh submission
    },
  });

  // Fictional Credit Card:
  // Cardholder name: Kabir
  // Generic card name: Ascend Credit Card
  await prisma.creditCard.create({
    data: {
      userId: demoUser.id,
      cardholderName: 'Kabir',
      cardName: 'Ascend Credit Card',
      last4: '8821',
      creditLimit: 150000,
      amountSpent: 36000, // 24% utilization -> green (< 30%)
      statementDate,
      dueDate,
      minimumDue: 1800,
    },
  });

  // Fictional Credit Score:
  // Fictional bureau name
  await prisma.creditScore.create({
    data: {
      userId: demoUser.id,
      score: 765,
      bureauName: 'Ascend Credit Analytics',
      fetchedAt: now,
    },
  });

  console.log(`[Ascend Seed] Seed completed successfully. User ID: ${demoUser.id} (${demoEmail})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
