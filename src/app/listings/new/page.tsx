import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function NewListingRedirect() {
  redirect('/dashboard/add-listing')
}
