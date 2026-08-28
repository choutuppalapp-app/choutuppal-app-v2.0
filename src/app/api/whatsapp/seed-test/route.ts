import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export const runtime = 'nodejs'
export const revalidate = 3600

export async function POST() {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && user.role !== 'AGENT')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const testPhone1 = '919494348175'
    const testPhone2 = '919876543210'

    // 1. Create Test Contact 1 (Business Owner)
    await prisma.whatsAppContact.upsert({
      where: { phone: testPhone1 },
      update: {
        name: 'వెంకటేష్ గౌడ్',
        userType: 'business_owner',
        tag: 'Business Owner',
        dateOfBirth: '15-08',
      },
      create: {
        phone: testPhone1,
        name: 'వెంకటేష్ గౌడ్',
        userType: 'business_owner',
        tag: 'Business Owner',
        dateOfBirth: '15-08',
        source: 'seed_test',
        messageCount: 3,
        chatState: 'none',
      },
    })

    // Insert 3 test logs for Contact 1
    await prisma.whatsAppLog.createMany({
      data: [
        {
          phone: testPhone1,
          direction: 'inbound',
          message: 'నమస్కారం! చౌటుప్పల్ లో నా క్లాత్ స్టోర్ లిస్ట్ చేయాలనుకుంటున్నాను.',
          createdAt: new Date(Date.now() - 1000 * 60 * 15),
        },
        {
          phone: testPhone1,
          direction: 'outbound',
          message: 'శుభోదయం వెంకటేష్ గారు! మీ బిజినెస్ ని మన వెబ్సైట్ లో ఉచితంగా లిస్ట్ చేయగలరు: https://choutuppal.in/dashboard',
          createdAt: new Date(Date.now() - 1000 * 60 * 10),
        },
        {
          phone: testPhone1,
          direction: 'inbound',
          message: 'ధన్యవాదాలు! నేను వివరాలు నమోదు చేసాను.',
          createdAt: new Date(Date.now() - 1000 * 60 * 2),
        },
      ],
    })

    // 2. Create Test Contact 2 (Customer)
    await prisma.whatsAppContact.upsert({
      where: { phone: testPhone2 },
      update: {
        name: 'సౌమ్య రెడ్డి',
        userType: 'customer',
        tag: 'Service Seeker',
      },
      create: {
        phone: testPhone2,
        name: 'సౌమ్య రెడ్డి',
        userType: 'customer',
        tag: 'Service Seeker',
        source: 'seed_test',
        messageCount: 2,
        chatState: 'none',
      },
    })

    // Insert test logs for Contact 2
    await prisma.whatsAppLog.createMany({
      data: [
        {
          phone: testPhone2,
          direction: 'inbound',
          message: 'చౌటుప్పల్ లో బెస్ట్ ఎలక్ట్రీషియన్ నంబర్ కావాలి.',
          createdAt: new Date(Date.now() - 1000 * 60 * 30),
        },
        {
          phone: testPhone2,
          direction: 'outbound',
          message: 'నమస్తే! సాయి ఎలక్ట్రికల్స్ చౌటుప్పల్: 9491065911 అని సంప్రదించండి.',
          createdAt: new Date(Date.now() - 1000 * 60 * 25),
        },
      ],
    })

    return NextResponse.json({ ok: true, message: 'Test conversation seeded successfully!' })
  } catch (err) {
    console.error('[CRM Seed Test API] Error:', err)
    return NextResponse.json({ error: 'Failed to seed test conversation' }, { status: 500 })
  }
}
