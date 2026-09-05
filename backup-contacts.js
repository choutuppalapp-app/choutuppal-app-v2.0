const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Fetching contacts from database...');
    // Fetch all WhatsAppContact records, including their associated groups
    const contacts = await prisma.whatsAppContact.findMany({
      include: {
        groups: true
      }
    });

    const backupPath = path.join(__dirname, 'contacts-backup.json');
    
    // Write the output to contacts-backup.json
    fs.writeFileSync(backupPath, JSON.stringify(contacts, null, 2));

    console.log(`Backup completed successfully.`);
    console.log(`Total contacts backed up: ${contacts.length}`);
    console.log(`File saved to: ${backupPath}`);
  } catch (error) {
    console.error('Error backing up contacts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
