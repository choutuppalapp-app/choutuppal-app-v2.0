import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { AddListingForm } from '@/components/dashboard/add-listing-form'
import { STANDARD_CATEGORIES, STANDARD_VILLAGES } from '@/lib/offline-data'
import { Loader2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Add New Listing | Choutuppal Super App',
  description: 'Add a new business, service provider, or real estate property listing with instant URL image preview.',
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
    villages = vList && vList.length > 0 ? vList : []
    categories = cList && cList.length > 0 ? cList : []
  } catch {
    // fallback
  }

  if (villages.length === 0) {
    villages = STANDARD_VILLAGES.map((v) => ({
      id: v.slug,
      name: v.name,
      slug: v.slug,
    }))
  }

  if (categories.length === 0) {
    categories = STANDARD_CATEGORIES.map((c) => ({
      id: c.slug,
      name: c.name,
      slug: c.slug,
    }))
  }

  return { villages, categories }
}

export default async function AddListingPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login?callbackUrl=/dashboard/add-listing')
  }

  const { villages, categories } = await getInitialFormData()

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 pt-6">
      <div className="mx-auto max-w-5xl px-3 sm:px-4 lg:px-6">
        <Suspense
          fallback={
            <div className="flex min-h-[400px] items-center justify-center">
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
      </div>
    </div>
  )
}
