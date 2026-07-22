import type { LucideIcon } from 'lucide-react'

export const POLITICAL_TAGS = ['BJP', 'CONGRESS', 'BRS', 'CPM'] as const
export type PoliticalTag = (typeof POLITICAL_TAGS)[number]

interface TagStyle {
  label: string
  full: string
  cls: string
  dot: string
}

/** Visual styles for each political tag badge. */
export const TAG_STYLES: Record<string, TagStyle> = {
  BJP: { label: 'BJP', full: 'Bharatiya Janata Party', cls: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
  CONGRESS: { label: 'Congress', full: 'Indian National Congress', cls: 'bg-sky-100 text-sky-700 border-sky-200', dot: 'bg-sky-500' },
  BRS: { label: 'BRS', full: 'Bharat Rashtra Samithi', cls: 'bg-pink-100 text-pink-700 border-pink-200', dot: 'bg-pink-500' },
  CPM: { label: 'CPM', full: 'Communist Party of India (Marxist)', cls: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500' },
  NONE: { label: '', full: '', cls: '', dot: '' },
}

export function tagStyle(tag: string): TagStyle {
  return TAG_STYLES[tag] ?? TAG_STYLES.NONE
}
