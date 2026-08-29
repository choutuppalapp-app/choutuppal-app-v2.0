'use server';

import prisma from '@/lib/prisma';

export async function getContacts() {
  const contacts = await prisma.whatsAppContact.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return contacts.map(c => ({
    id: c.id,
    name: c.name || '',
    phone: c.phone,
    email: '',
    company: '',
    tags: c.tag ? [{ id: c.tag, name: c.tag, color: 'blue', user_id: '', created_at: '' }] : [],
    created_at: c.createdAt.toISOString(),
  }));
}

export async function deleteContact(id: string) {
  await prisma.whatsAppContact.delete({
    where: { id }
  });
}
