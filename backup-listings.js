const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Fetching listings from database...');
    const listings = await prisma.listing.findMany({
      include: {
        category: true,
        village: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        tenant: true
      }
    });

    const backupPath = path.join(__dirname, 'listings-backup.json');
    
    // Write the output to listings-backup.json
    fs.writeFileSync(backupPath, JSON.stringify(listings, null, 2));

    console.log(`Backup completed successfully.`);
    console.log(`Total listings backed up: ${listings.length}`);
    console.log(`File saved to: ${backupPath}`);
  } catch (error) {
    console.error('Error backing up listings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
