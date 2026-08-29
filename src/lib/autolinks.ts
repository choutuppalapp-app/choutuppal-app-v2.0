import Image from 'next/image';
export interface AutoLinkItem {
  id?: string
  keyword: string
  url: string
  type: string
}

/**
 * Replaces the first occurrence of each keyword in the HTML content with an anchor tag.
 * Does not replace keywords inside existing HTML tags (e.g. <Image width={800} height={800} src="..."> or inside <a ...>...</a>).
 */
export function applyAutoLinks(htmlContent: string, autoLinks: AutoLinkItem[]): string {
  if (!htmlContent || !autoLinks || autoLinks.length === 0) {
    return htmlContent
  }

  let processed = htmlContent

  for (const link of autoLinks) {
    if (!link.keyword || !link.url) continue
    const keyword = link.keyword.trim()
    if (!keyword) continue

    // Escape regex special characters
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    // Match keyword only outside existing HTML tags and existing <a> links
    // Negative lookbehind for '<' without '>' and negative lookahead for '>' without '<'
    // Also skip inside existing <a> tags
    const regex = new RegExp(`(?<!<[^>]*)\\b(${escaped})\\b(?![^<]*>)(?![^<]*<\\/a>)`, 'i')

    const relAttr = link.type === 'affiliate' ? 'rel="sponsored nofollow noopener"' : 'rel="noopener"'
    const replacement = `<a href="${link.url}" ${relAttr} target="_blank" class="font-semibold text-blue-600 underline hover:text-blue-800 transition-colors">$1</a>`

    // Replace ONLY the first occurrence per keyword
    processed = processed.replace(regex, replacement)
  }

  return processed
}
