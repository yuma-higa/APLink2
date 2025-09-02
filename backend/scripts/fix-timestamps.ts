// Migration script to fix existing Auth records with null createdAt/updatedAt values
// Run this script to update existing records

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateExistingAuthRecords() {
  console.log('Starting migration to fix createdAt/updatedAt fields...');
  
  try {
    // Get all Auth records that have null createdAt or updatedAt
    const authRecords = await prisma.auth.findMany({
      where: {
        OR: [
          { createdAt: null },
          { updatedAt: null }
        ]
      }
    });
    
    console.log(`Found ${authRecords.length} records with null timestamps`);
    
    // Update each record with current timestamp
    const now = new Date();
    
    for (const record of authRecords) {
      await prisma.auth.update({
        where: { id: record.id },
        data: {
          createdAt: record.createdAt || now,
          updatedAt: record.updatedAt || now,
        }
      });
      console.log(`Updated record: ${record.name}`);
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateExistingAuthRecords();
