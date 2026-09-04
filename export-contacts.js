const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  try {
    const contacts = await prisma.whatsAppContact.findMany();
    
    let csvContent = 'id,name,phone,createdAt\n';
    
    contacts.forEach(contact => {
      const id = contact.id || '';
      // Escape quotes in name
      const name = contact.name ? `"${contact.name.replace(/"/g, '""')}"` : '';
      const phone = contact.phone || '';
      const createdAt = contact.createdAt ? new Date(contact.createdAt).toISOString() : '';
      
      csvContent += `${id},${name},${phone},${createdAt}\n`;
    });
    
    const outputPath = path.join(__dirname, 'contacts-export.csv');
    fs.writeFileSync(outputPath, csvContent);
    console.log(`Export completed. File saved to ${outputPath}`);
  } catch (error) {
    console.error('Error exporting contacts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
