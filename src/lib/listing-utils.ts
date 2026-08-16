export interface ListingLike {
  logo?: string | null
  logoImage?: string | null
  coverImage?: string | null
  category?: { name?: string | null } | string | null
  village?: { name?: string | null } | string | null
  businessHours?: any
  servicesCatalog?: any
}

function getCategoryName(category?: { name?: string | null } | string | null): string {
  if (!category) return ''
  if (typeof category === 'string') return category.toLowerCase()
  return (category.name || '').toLowerCase()
}

export function getLogoUrl(listing?: ListingLike | null): string {
  if (!listing) {
    return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=150&h=150&q=80'
  }
  const logo = listing.logoImage || listing.logo
  if (logo && typeof logo === 'string' && logo.trim()) {
    return logo.trim()
  }

  const catName = getCategoryName(listing.category)

  if (catName.includes('food') || catName.includes('dining') || catName.includes('restaurant') || catName.includes('hotel') || catName.includes('bakery')) {
    return 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=150&h=150&q=80'
  }
  if (catName.includes('health') || catName.includes('medical') || catName.includes('hospital') || catName.includes('clinic') || catName.includes('pharmacy')) {
    return 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=150&h=150&q=80'
  }
  if (catName.includes('auto') || catName.includes('car') || catName.includes('bike') || catName.includes('vehicle') || catName.includes('mechanic')) {
    return 'https://images.unsplash.com/photo-1486754735734-325b5831c3ad?auto=format&fit=crop&w=150&h=150&q=80'
  }
  if (catName.includes('edu') || catName.includes('school') || catName.includes('college') || catName.includes('tuition') || catName.includes('coaching')) {
    return 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=150&h=150&q=80'
  }
  if (catName.includes('retail') || catName.includes('shop') || catName.includes('store') || catName.includes('clothing') || catName.includes('fashion') || catName.includes('mall')) {
    return 'https://images.unsplash.com/photo-1472850543286-069f6cfacc59?auto=format&fit=crop&w=150&h=150&q=80'
  }
  if (catName.includes('service') || catName.includes('plumber') || catName.includes('electric') || catName.includes('repair')) {
    return 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=150&h=150&q=80'
  }
  if (catName.includes('real estate') || catName.includes('property') || catName.includes('land') || catName.includes('plot') || catName.includes('flat')) {
    return 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=150&h=150&q=80'
  }
  if (catName.includes('agri') || catName.includes('farm') || catName.includes('seed') || catName.includes('fertilizer')) {
    return 'https://images.unsplash.com/photo-1625825943869-956e3f78bc36?auto=format&fit=crop&w=150&h=150&q=80'
  }
  if (catName.includes('transport') || catName.includes('travel') || catName.includes('cab') || catName.includes('bus') || catName.includes('goods')) {
    return 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=150&h=150&q=80'
  }
  if (catName.includes('electron') || catName.includes('mobile') || catName.includes('laptop') || catName.includes('computer') || catName.includes('tv')) {
    return 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=150&h=150&q=80'
  }

  return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=150&h=150&q=80'
}

export function getCoverUrl(listing?: ListingLike | null): string {
  if (!listing) {
    return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&h=400&q=80'
  }
  if (listing.coverImage && typeof listing.coverImage === 'string' && listing.coverImage.trim()) {
    return listing.coverImage.trim()
  }

  const catName = getCategoryName(listing.category)

  if (catName.includes('food') || catName.includes('dining') || catName.includes('restaurant') || catName.includes('hotel') || catName.includes('bakery')) {
    return 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&h=400&q=80'
  }
  if (catName.includes('health') || catName.includes('medical') || catName.includes('hospital') || catName.includes('clinic') || catName.includes('pharmacy')) {
    return 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=600&h=400&q=80'
  }
  if (catName.includes('auto') || catName.includes('car') || catName.includes('bike') || catName.includes('vehicle') || catName.includes('mechanic')) {
    return 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=600&h=400&q=80'
  }
  if (catName.includes('edu') || catName.includes('school') || catName.includes('college') || catName.includes('tuition') || catName.includes('coaching')) {
    return 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&h=400&q=80'
  }
  if (catName.includes('retail') || catName.includes('shop') || catName.includes('store') || catName.includes('clothing') || catName.includes('fashion') || catName.includes('mall')) {
    return 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&h=400&q=80'
  }
  if (catName.includes('service') || catName.includes('plumber') || catName.includes('electric') || catName.includes('repair')) {
    return 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&h=400&q=80'
  }
  if (catName.includes('real estate') || catName.includes('property') || catName.includes('land') || catName.includes('plot') || catName.includes('flat')) {
    return 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&h=400&q=80'
  }
  if (catName.includes('agri') || catName.includes('farm') || catName.includes('seed') || catName.includes('fertilizer')) {
    return 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=600&h=400&q=80'
  }
  if (catName.includes('transport') || catName.includes('travel') || catName.includes('cab') || catName.includes('bus') || catName.includes('goods')) {
    return 'https://images.unsplash.com/photo-1580612432646-3d8e0a5d3c44?auto=format&fit=crop&w=600&h=400&q=80'
  }
  if (catName.includes('electron') || catName.includes('mobile') || catName.includes('laptop') || catName.includes('computer') || catName.includes('tv')) {
    return 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&h=400&q=80'
  }

  return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&h=400&q=80'
}

export function getBusinessHours(listing?: ListingLike | null): string {
  if (!listing || !listing.businessHours) return '9 AM - 9 PM'
  if (typeof listing.businessHours === 'string' && listing.businessHours.trim()) {
    return listing.businessHours.trim()
  }
  if (typeof listing.businessHours === 'object') {
    const raw = listing.businessHours.raw || listing.businessHours.formatted || listing.businessHours.text
    if (raw && typeof raw === 'string' && raw.trim()) return raw.trim()
  }
  return '9 AM - 9 PM'
}

export function getVillage(listing?: ListingLike | null): string {
  if (!listing) return 'Choutuppal'
  if (typeof listing.village === 'string' && listing.village.trim()) {
    return listing.village.trim()
  }
  if (listing.village && typeof listing.village === 'object' && listing.village.name) {
    return listing.village.name.trim()
  }
  return 'Choutuppal'
}

export function getServices(listing?: ListingLike | null): string {
  if (!listing || !listing.servicesCatalog) return 'సేవలు::0::అందుబాటులో ఉన్నాయి'
  if (typeof listing.servicesCatalog === 'string' && listing.servicesCatalog.trim()) {
    return listing.servicesCatalog.trim()
  }
  if (Array.isArray(listing.servicesCatalog) && listing.servicesCatalog.length > 0) {
    return listing.servicesCatalog
      .map((s: any) => `${s.name || 'Service'}::${s.price ?? 0}::${s.description || 'అందుబాటులో ఉన్నాయి'}`)
      .join(' || ')
  }
  return 'సేవలు::0::అందుబాటులో ఉన్నాయి'
}
