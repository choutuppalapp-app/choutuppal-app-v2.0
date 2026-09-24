import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { AddListingForm } from '@/components/dashboard/add-listing-form'
import { STANDARD_VILLAGES } from '@/lib/offline-data'
import { Loader2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Post New Listing | Choutuppal Dashboard',
  description: 'Add a new business, service provider, or real estate property to Choutuppal Super App.',
}

async function getInitialFormData() {
  let villages: any[] = []
  let categories: any[] = []

  try {
    const [vList, cList] = await Promise.all([
      prisma.village.findMany({
        select: { id: true, name: true, slug: true },
        orderBy: { name: 'asc' },
      }),
      prisma.category.findMany({
        select: { id: true, name: true, slug: true },
        orderBy: { name: 'asc' },
      }),
    ])
    villages = vList
    categories = cList
  } catch (err) {
    // offline fallback
    villages = STANDARD_VILLAGES.map((v) => ({
      id: v.slug,
      name: v.name,
      slug: v.slug,
    }))
  }

  return { villages, categories }
}

export default async function NewListingPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?callbackUrl=/profile/listings/new')

  const { villages, categories } = await getInitialFormData()

  return (
    <Suspense
      fallback={
        <div className="grid min-h-[400px] place-items-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <AddListingForm
        initialVillages={villages}
        initialCategories={categories}
        defaultType="business"
      />
    </Suspense>
  )
}
