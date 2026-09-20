export interface OfflineListing {
  id: string
  slug: string
  title: string
  description?: string | null
  status: string
  isFeatured: boolean
  isPremium?: boolean
  coverImage?: string | null
  logo?: string | null
  phone?: string | null
  secondaryPhone?: string | null
  whatsapp?: string | null
  email?: string | null
  website?: string | null
  address?: string | null
  mapEmbed?: string | null
  businessHours?: any
  servicesCatalog?: any
  avgRating?: number | null
  views?: number
  categoryId?: string | null
  villageId?: string | null
  category?: { id: string; name: string; slug: string; icon?: string | null; telugu?: string } | null
  village?: { id: string; name: string; slug: string } | null
  owner?: { id: string; name: string; username?: string; phone?: string | null; image?: string | null } | null
  createdAt?: string
  updatedAt?: string
  [key: string]: any
}

export interface ServiceCategory {
  id: string
  name: string
  slug: string
  icon: string
  telugu: string
  description: string
}

export const STANDARD_CATEGORIES: ServiceCategory[] = [
  { id: 'cmso8tgy60002v35o914xbblk', name: 'Automobile & Garage', slug: 'automobile', icon: 'Car', telugu: 'ఆటోమొబైల్ & గ్యారేజ్', description: 'Auto sales, service centers, spare parts & bike repair' },
  { id: 'cat-services', name: 'Services & Technicians', slug: 'services', icon: 'Wrench', telugu: 'సేవలు & టెక్నీషియన్లు', description: 'Electricians, plumbers, mechanics, AC repair & home services' },
  { id: 'cat-electrical', name: 'Electrical & Hardware', slug: 'electrical-hardware', icon: 'Zap', telugu: 'ఎలక్ట్రికల్ & హార్డ్‌వేర్', description: 'Electrical goods, wiring, motors & hardware tools' },
  { id: 'cat-medical', name: 'Health & Medical', slug: 'health-medical', icon: 'HeartPulse', telugu: 'వైద్యం & ఫార్మసీ', description: 'Hospitals, clinics, medical stores & diagnostic centers' },
  { id: 'cat-food', name: 'Food & Restaurants', slug: 'food-dining', icon: 'UtensilsCrossed', telugu: 'హోటల్స్ & రెస్టారెంట్లు', description: 'Restaurants, tiffin centers, bakeries & sweets' },
  { id: 'cat-internet', name: 'Internet & MeeSeva', slug: 'internet-cyber-cafe', icon: 'Globe', telugu: 'మీసేవ & నెట్ సెంటర్', description: 'MeeSeva, Cyber Cafe, Xerox, online forms & DTP' },
  { id: 'cat-building', name: 'Building Materials', slug: 'building-materials', icon: 'BrickWall', telugu: 'భవన నిర్మాణ సామాగ్రి', description: 'Cement, steel, sand, bricks & construction supply' },
  { id: 'cat-engineering', name: 'Engineering & Welding', slug: 'engineering-welding', icon: 'Flame', telugu: 'ఇంజనీరింగ్ & వెల్డింగ్', description: 'Welding works, fabrication, grill & shutter manufacturing' },
  { id: 'cat-agriculture', name: 'Agriculture & Seeds', slug: 'agriculture-seeds', icon: 'Sprout', telugu: 'వ్యవసాయం & ఎరువులు', description: 'Seeds, pesticides, fertilizers & agriculture equipment' },
  { id: 'cat-furniture', name: 'Furniture & Home', slug: 'furniture-home', icon: 'Armchair', telugu: 'ఫర్నిచర్ & డెకార్', description: 'Furniture showrooms, wood works, mattresses & home decor' },
  { id: 'cat-interior', name: 'Interior & Paints', slug: 'interior-decor', icon: 'Paintbrush', telugu: 'ఇంటీరియర్ & పెయింట్స్', description: 'Paints, false ceiling, glass, ACP & interior design' },
  { id: 'cat-retail', name: 'Retail & Fashion', slug: 'retail-fashion', icon: 'Shirt', telugu: 'షాపింగ్ & దుస్తులు', description: 'Cloth stores, readymade garments, footwear & matching' },
  { id: 'cat-agencies', name: 'Agencies & Distributors', slug: 'agencies-distributors', icon: 'Briefcase', telugu: 'ఏజెన్సీలు & హోల్‌సేల్', description: 'Wholesale dealers, commercial agencies & distribution' },
  { id: 'cat-realestate', name: 'Real Estate & Lands', slug: 'real-estate', icon: 'Building2', telugu: 'రియల్ ఎస్టేట్ & ప్లాట్లు', description: 'Open plots, farmland, commercial properties & houses' },
]

const CATEGORY_MAP_BY_SLUG = new Map(STANDARD_CATEGORIES.map((c) => [c.slug, c]))

let cachedListings: OfflineListing[] | null = null
let listingsByIdMap: Map<string, OfflineListing> | null = null
let listingsBySlugMap: Map<string, OfflineListing> | null = null
let cachedCategories: ServiceCategory[] | null = null
let cachedVillages: any[] | null = null

const DEFAULT_OFFLINE_LISTINGS: OfflineListing[] = [
  {
    id: 'list-sairam-elec',
    slug: 'sri-sai-ram-electricals-choutuppal',
    title: 'Sri Sai Ram Electricals & Plumber Works',
    description: 'Expert residential & commercial wiring, motor rewinding, switchboard repairs, and plumbing pipe fittings.',
    status: 'APPROVED',
    isFeatured: true,
    isPremium: true,
    coverImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80',
    phone: '9494348175',
    whatsapp: '9494348175',
    address: 'Main Road, Near Bus Stand, Choutuppal',
    avgRating: 4.8,
    views: 142,
    categoryId: 'cat-electrical',
    villageId: 'cmsepb40r0000jv04tdwwd5cw',
    category: { id: 'cat-electrical', name: 'Electrical & Hardware', slug: 'electrical-hardware', icon: 'Zap', telugu: 'ఎలక్ట్రికల్ & హార్డ్‌వేర్' },
    village: { id: 'cmsepb40r0000jv04tdwwd5cw', name: 'Choutuppal', slug: 'choutuppal' },
    owner: { id: 'cms0du1m40000v32slild2p1s', name: 'Sai Ram', phone: '9494348175' }
  },
  {
    id: 'list-venkat-med',
    slug: 'venkateshwara-medical-choutuppal',
    title: 'Venkateshwara Medical & General Stores',
    description: '24/7 all prescription medicines, surgical supplies, baby care products, and wellness essentials.',
    status: 'APPROVED',
    isFeatured: true,
    isPremium: false,
    coverImage: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=800&auto=format&fit=crop&q=80',
    phone: '9849123456',
    whatsapp: '9849123456',
    address: 'Opp. Community Hospital, Choutuppal',
    avgRating: 4.6,
    views: 98,
    categoryId: 'cat-medical',
    villageId: 'cmsepb40r0000jv04tdwwd5cw',
    category: { id: 'cat-medical', name: 'Health & Medical', slug: 'health-medical', icon: 'HeartPulse', telugu: 'వైద్యం & ఫార్మసీ' },
    village: { id: 'cmsepb40r0000jv04tdwwd5cw', name: 'Choutuppal', slug: 'choutuppal' },
    owner: { id: 'cms0du1m40000v32slild2p1s', name: 'Venkateshwara', phone: '9849123456' }
  },
  {
    id: 'list-chout-realestate',
    slug: 'choutuppal-real-estate-lands',
    title: 'Choutuppal Real Estate & Land Developers',
    description: 'HMDA & DTCP approved open plots, residential house ventures, industrial lands along NH-65 corridor.',
    status: 'APPROVED',
    isFeatured: true,
    isPremium: true,
    coverImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=80',
    phone: '9440123456',
    whatsapp: '9440123456',
    address: 'NH-65 Highway Junction, Choutuppal',
    avgRating: 4.9,
    views: 230,
    categoryId: 'cat-realestate',
    villageId: 'cmsepb40r0000jv04tdwwd5cw',
    category: { id: 'cat-realestate', name: 'Real Estate & Lands', slug: 'real-estate', icon: 'Building2', telugu: 'రియల్ ఎస్టేట్ & ప్లాట్లు' },
    village: { id: 'cmsepb40r0000jv04tdwwd5cw', name: 'Choutuppal', slug: 'choutuppal' },
    owner: { id: 'cms0du1m40000v32slild2p1s', name: 'Real Estate Office', phone: '9440123456' }
  }
]

export function getOfflineListings(): OfflineListing[] {
  if (cachedListings) return cachedListings
  cachedListings = [...DEFAULT_OFFLINE_LISTINGS]
  listingsByIdMap = new Map()
  listingsBySlugMap = new Map()

  for (const item of cachedListings) {
    if (item.id) listingsByIdMap.set(item.id, item)
    if (item.slug) listingsBySlugMap.set(item.slug, item)
  }

  return cachedListings
}

export function getOfflineListingById(id: string): OfflineListing | null {
  if (!listingsByIdMap) getOfflineListings()
  return listingsByIdMap?.get(id) || null
}

export function getOfflineListingBySlug(slug: string): OfflineListing | null {
  if (!listingsBySlugMap) getOfflineListings()
  return listingsBySlugMap?.get(slug) || null
}

export function getOfflineCategories(): ServiceCategory[] {
  if (cachedCategories) return cachedCategories
  cachedCategories = STANDARD_CATEGORIES
  return cachedCategories
}

export function getOfflineVillages(): any[] {
  if (cachedVillages) return cachedVillages
  const listings = getOfflineListings()
  const villageMap = new Map<string, any>()
  for (const item of listings) {
    if (item.village && item.village.id) {
      if (!villageMap.has(item.village.id)) {
        villageMap.set(item.village.id, {
          id: item.village.id,
          name: item.village.name,
          slug: item.village.slug,
        })
      }
    }
  }
  if (villageMap.size === 0) {
    villageMap.set('cmsepb40r0000jv04tdwwd5cw', {
      id: 'cmsepb40r0000jv04tdwwd5cw',
      name: 'Choutuppal',
      slug: 'choutuppal',
    })
  }
  cachedVillages = Array.from(villageMap.values())
  return cachedVillages
}

export function getOfflineSettings(): any[] {
  return [
    { key: 'spin_enabled', value: 'true' },
    { key: 'hero_title', value: 'Choutuppal App' },
    { key: 'hero_subtitle', value: 'Your Town, All In One App' },
    { key: 'hero_bg_image', value: '/images/hero-banner.webp' },
  ]
}

export function getOfflineBanners(): any[] {
  return [
    {
      id: 'banner-welcome',
      title: 'Welcome to Choutuppal',
      imageUrl: '/images/hero-banner.webp',
      link: '/categories',
      isActive: true,
    },
  ]
}

export function getOfflineNews(): any[] {
  return [
    {
      id: 'news-nh65-widening',
      slug: 'nh-65-highway-widening-choutuppal',
      title: 'చౌటుప్పల్ జాతీయ రహదారి 65 విస్తరణ పనులు ముమ్మరం - ట్రాఫిక్ సమస్యలకు శాశ్వత పరిష్కారం',
      summary: 'హైదరాబాద్-విజయవాడ జాతీయ రహదారి (NH 65) విస్తరణ మరియు సర్వీస్ రోడ్ల ఆధునీకరణ పనులను వేగవంతం చేస్తున్నారు.',
      content: `హైదరాబాద్-విజయవాడ జాతీయ రహదారి (NH 65) పై చౌటుప్పల్ పట్టణ పరిధిలో నిత్యం పెరుగుతున్న ట్రాఫిక్ రద్దీని నియంత్రించేందుకు విస్తరణ పనులను అధికార యంత్రాంగం వేగవంతం చేసింది. 

ప్రధాన కూడళ్లు, బస్టాండ్ సమీపంలో పాదచారుల అండర్‌పాస్‌లు మరియు విస్తృతమైన సర్వీస్ రోడ్ల నిర్మాణం చురుగ్గా సాగుతోంది. దీనివల్ల స్థానిక వ్యాపారులకు, వాహనదారులకు రాకపోకలు సులభతరం కానున్నాయి.

జిల్లా ఉన్నతాధికారులు పనుల పురోగతిని ఎప్పటికప్పుడు సమీక్షిస్తూ, నిర్దేశిత గడువులోగా పనులు పూర్తి చేయాలని ఆదేశాలు జారీ చేశారు. ప్రమాదాల నివారణకు అధునాతన సైన్ బోర్డులు మరియు సీసీ కెమెరాల నిఘా కూడా ఏర్పాటు చేస్తున్నారు.`,
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&auto=format&fit=crop&q=80',
      tags: ['Choutuppal', 'NH65', 'Development', 'Infrastructure'],
      isPublished: true,
      publishedAt: '2026-09-18T10:00:00.000Z',
      authorId: 'cms0du1m40000v32slild2p1s',
      author: { name: 'Choutuppal Vartha Desk' },
      tenantId: null,
      createdAt: '2026-09-18T10:00:00.000Z',
      updatedAt: '2026-09-18T10:00:00.000Z',
    },
    {
      id: 'news-textile-cluster',
      slug: 'choutuppal-handloom-textile-cluster',
      title: 'చౌటుప్పల్ పరిధిలో నూతన వస్త్ర మరియు చేనేత క్లస్టర్ ఏర్పాటుకు ముమ్మర సన్నాహాలు',
      summary: 'చేనేత కార్మికులకు నూతన మార్కెటింగ్ అవకాశాలు, ప్రభుత్వ రాయితీలు మరియు ఆధునిక సాంకేతిక శిక్షణ కేంద్రం ప్రారంభం.',
      content: `యాదాద్రి భువనగిరి జిల్లాలో చేనేత, జౌళి రంగానికి పూర్వ వైభవం తీసుకువచ్చే దిశగా చౌటుప్పల్ పరిసర ప్రాంతాల్లో నూతన వస్త్ర క్లస్టర్ ఏర్పాటుకు చర్యలు ప్రారంభమయ్యాయి.

పొచంపల్లి, చౌటుప్పల్ చేనేత కళాకారులకు డిజిటల్ మార్కెటింగ్ మరియు నేరుగా కొనుగోలుదారులతో అనుసంధానం కల్పించే ప్రత్యేక వేదికను సిద్ధం చేస్తున్నారు.

దీని ద్వారా స్థానిక చేనేత కుటుంబాలకు మరింత ఆదాయం మరియు అంతర్జాతీయ స్థాయిలో గుర్తింపు లభించనుంది. బ్యాంకుల ద్వారా సులభ వాయిదాల రుణ సదుపాయాలు మరియు ముడి సరుకుల రాయితీలు కూడా కల్పించనున్నారు.`,
      image: 'https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?w=1200&auto=format&fit=crop&q=80',
      tags: ['Handloom', 'Textiles', 'Choutuppal', 'Economy'],
      isPublished: true,
      publishedAt: '2026-09-16T08:30:00.000Z',
      authorId: 'cms0du1m40000v32slild2p1s',
      author: { name: 'District News Desk' },
      tenantId: null,
      createdAt: '2026-09-16T08:30:00.000Z',
      updatedAt: '2026-09-16T08:30:00.000Z',
    },
    {
      id: 'news-digital-meeseva',
      slug: 'choutuppal-digital-meeseva-services',
      title: 'చౌటుప్పల్ మున్సిపాలిటీలో పౌరసేవల మొబైల్ యూనిట్లు మరియు డిజిటల్ మీసేవ విస్తరణ',
      summary: 'పౌరుల ముంగిట్లోనే జనన, మరణ ధ్రువీకరణ పత్రాలు, ఆస్తి పన్ను అసెస్‌మెంట్ మరియు ఆధార్ సేవల సులభ నమోదు.',
      content: `చౌటుప్పల్ మున్సిపల్ పరిధిలోని అన్ని వార్డులలో పౌరులకు సత్వర సేవలు అందించేందుకు ప్రత్యేక మొబైల్ పౌరసేవా కేంద్రాలు అందుబాటులోకి వచ్చాయి.

ప్రజలు కార్యాలయాల చుట్టూ తిరిగే అవసరం లేకుండానే తమ పరిసరాల్లోనే ఆస్తి పన్ను, తాగునీటి కనెక్షన్ దరఖాస్తులు, ట్రేడ్ లైసెన్సుల నవీకరణ మరియు మీసేవ సేవలను తక్షణమే పొందవచ్చు.

మున్సిపల్ అధికారులు ప్రజల సమస్యలను నేరుగా స్వీకరించి సత్వర పరిష్కారాలు చూపుతున్నారు. డిజిటల్ టోకెన్ విధానం ద్వారా పారదర్శకమైన సేవలు అందుతున్నాయి.`,
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
      tags: ['MeeSeva', 'Municipality', 'Choutuppal', 'CitizenServices'],
      isPublished: true,
      publishedAt: '2026-09-14T09:15:00.000Z',
      authorId: 'cms0du1m40000v32slild2p1s',
      author: { name: 'Choutuppal Live' },
      tenantId: null,
      createdAt: '2026-09-14T09:15:00.000Z',
      updatedAt: '2026-09-14T09:15:00.000Z',
    },
    {
      id: 'news-yadadri-power',
      slug: 'yadadri-agriculture-power-substation',
      title: 'యాదాద్రి భువనగిరి పరిధిలో వ్యవసాయ నిరంతర విద్యుత్ మరియు అదనపు సబ్-స్టేషన్లు',
      summary: 'రైతులకు నాణ్యమైన విద్యుత్ సరఫరా కోసం చౌటుప్పల్ రూరల్ పరిధిలో అదనపు ట్రాన్స్‌ఫార్మర్లు, నిరంతర పర్యవేక్షణ.',
      content: `యాదాద్రి భువనగిరి జిల్లా చౌటుప్పల్ డివిజన్ వ్యాప్తంగా వ్యవసాయ ఫీడర్లకు మరింత నాణ్యమైన విద్యుత్ సరఫరాను అందించేందుకు విద్యుత్ శాఖ నూతన లైన్లను సిద్ధం చేసింది.

రైతులు లో-వోల్టేజ్ సమస్యలు ఎదుర్కోకుండా ప్రత్యేక ట్రాన్స్‌ఫార్మర్లను ఏర్పాటు చేయడంతో పాటు, వర్షాకాలంలో అంతరాయాలు రాకుండా నిరంతర కాల్ సెంటర్ సహాయం అందుబాటులో ఉంచారు.`,
      image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&auto=format&fit=crop&q=80',
      tags: ['Farmers', 'Agriculture', 'Yadadri', 'Telangana'],
      isPublished: true,
      publishedAt: '2026-09-12T11:00:00.000Z',
      authorId: 'cms0du1m40000v32slild2p1s',
      author: { name: 'Agri Desk' },
      tenantId: null,
      createdAt: '2026-09-12T11:00:00.000Z',
      updatedAt: '2026-09-12T11:00:00.000Z',
    },
  ]
}

export function getOfflineBlogs(): any[] {
  return [
    {
      id: 'blog-grow-local-business',
      slug: 'grow-local-business-choutuppal-guide',
      title: 'చౌటుప్పల్‌లో చిన్న వ్యాపారాన్ని డిజిటల్ ద్వారా ఎలా పెంచుకోవాలి? - పూర్తి గైడ్',
      excerpt: 'లోకల్ బిజినెస్ యజమానులు గూగుల్ మ్యాప్స్, వాట్సాప్ బిజినెస్ మరియు చౌటుప్పల్ యాప్ ద్వారా కస్టమర్లను ఎలా ఆకర్షించవచ్చో తెలుసుకోండి.',
      content: `చౌటుప్పల్ వేగంగా అభివృద్ధి చెందుతున్న పట్టణం. ఇక్కడ ప్రతి దుకాణదారునికి, సేవా ప్రదాతకు డిజిటల్ ఉనికి అత్యవసరం.

1. **స్థానిక డైరెక్టరీలో లిస్టింగ్**: చౌటుప్పల్ యాప్‌లో మీ వ్యాపారాన్ని ఫోన్ నంబర్, వాట్సాప్ మరియు ఖచ్చితమైన చిరునామాతో నమోదు చేయండి.
2. **వాట్సాప్ క్యాటలాగ్**: మీ ఉత్పత్తులు, సేవల ధరలు మరియు ఫోటోలతో వాట్సాప్ బిజినెస్ ఖాతాను అప్‌డేట్ చేయండి.
3. **కస్టమర్ రివ్యూలు**: సంతృప్తి చెందిన కస్టమర్ల నుండి సమీక్షలు పొందడం వల్ల కొత్త కస్టమర్లకు నమ్మకం పెరుగుతుంది.
4. **ఫాస్ట్ రెస్పాన్స్**: ఫోన్ కాల్స్ మరియు సందేశాలకు వెంటనే స్పందించి వేగవంతమైన డెలివరీ లేదా సేవలందించండి.`,
      coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80',
      category: 'Business',
      tags: ['Business', 'Digital', 'Choutuppal', 'Guide'],
      isPublished: true,
      publishedAt: '2026-09-17T06:00:00.000Z',
      authorId: 'cms0du1m40000v32slild2p1s',
      author: { name: 'Choutuppal App Team' },
      tenantId: null,
      createdAt: '2026-09-17T06:00:00.000Z',
      updatedAt: '2026-09-17T06:00:00.000Z',
    },
    {
      id: 'blog-yadadri-darshan-guide',
      slug: 'yadadri-temple-darshan-guide',
      title: 'యాదాద్రి శ్రీ లక్ష్మీ నరసింహ స్వామి దర్శనం & చౌటుప్పల్ ప్రయాణ మార్గదర్శి',
      excerpt: 'చౌటుప్పల్ మీదుగా యాదగిరిగుట్ట దర్శనానికి వెళ్లే భక్తులకు రవాణా, సమయాలు, దర్శనం టికెట్ల వివరాలు మరియు ముఖ్యమైన సమాచారం.',
      content: `తెలంగాణ ప్రముఖ పుణ్యక్షేత్రం యాదాద్రి శ్రీ లక్ష్మీ నరసింహ స్వామి వారి దివ్య క్షేత్ర దర్శనానికి చౌటుప్పల్ నుండి సులువైన మార్గాలు మరియు దర్శనం వివరాలు:

- **ప్రయాణ మార్గం**: చౌటుప్పల్ నుండి వలిగొండ, భువనగిరి మీదుగా యాదగిరిగుట్ట చేరుకోవడం అత్యంత అనుకూలం.
- **దర్శనం వేళలు**: ఉదయం 4:00 నుండి రాత్రి 9:30 వరకు దర్శనాలు అందుబాటులో ఉంటాయి.
- **ఆన్‌లైన్ సేవలు**: ప్రత్యేక ప్రవేశ దర్శనం మరియు పూజల కోసం ఆన్‌లైన్ టికెట్లను ముందుగానే బుక్ చేసుకోవడం మంచిది.
- **వసతి & ఆహారం**: కొండపైన మరియు కింద భక్తులకు విస్తృత వసతి గదులు, ప్రసాదం కౌంటర్లు అందుబాటులో ఉన్నాయి.`,
      coverImage: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&auto=format&fit=crop&q=80',
      category: 'Travel & Culture',
      tags: ['Yadadri', 'Temple', 'Travel', 'Pilgrimage'],
      isPublished: true,
      publishedAt: '2026-09-15T07:30:00.000Z',
      authorId: 'cms0du1m40000v32slild2p1s',
      author: { name: 'Choutuppal App Team' },
      tenantId: null,
      createdAt: '2026-09-15T07:30:00.000Z',
      updatedAt: '2026-09-15T07:30:00.000Z',
    },
    {
      id: 'blog-real-estate-tips',
      slug: 'choutuppal-real-estate-investment-tips',
      title: 'చౌటుప్పల్ పరిసరాల్లో రియల్ ఎస్టేట్ మరియు భూముల కొనుగోలు సూచనలు',
      excerpt: 'హైదరాబాద్-విజయవాడ హైవే వెంబడి ఓపెన్ ప్లాట్లు, వ్యవసాయ భూములు కొనుగోలు చేసేటప్పుడు గమనించాల్సిన రెవెన్యూ నిబంధనలు.',
      content: `హైదరాబాద్ తూర్పు కారిడార్‌లో చౌటుప్పల్ ప్రాంతం రియల్ ఎస్టేట్ పెట్టుబడులకు ఆకర్షణీయ కేంద్రంగా మారింది. కొనుగోలుదారులు తీసుకోవలసిన జాగ్రత్తలు:

1. **లేఅవుట్ అనుమతులు**: DTCP లేదా HMDA ఆమోదం పొందిన లేఅవుట్లను మాత్రమే ఎంచుకోండి.
2. **ధరణి పోర్టల్ పరిశీలన**: వ్యవసాయ భూముల విషయంలో పాస్‌బుక్ వివరాలు, విస్తీర్ణం మరియు పహణీ రికార్డులను క్షుణ్ణంగా తనిఖీ చేయండి.
3. **రహదారి మరియు మౌలిక వసతులు**: హైవే కనెక్టివిటీ, నీరు మరియు విద్యుత్ సౌకర్యాలు ఉన్న ప్రాంతాలకు ప్రాధాన్యత ఇవ్వండి.`,
      coverImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&auto=format&fit=crop&q=80',
      category: 'Real Estate',
      tags: ['Real Estate', 'Choutuppal', 'Investment', 'Plots'],
      isPublished: true,
      publishedAt: '2026-09-13T09:00:00.000Z',
      authorId: 'cms0du1m40000v32slild2p1s',
      author: { name: 'Property Guide Desk' },
      tenantId: null,
      createdAt: '2026-09-13T09:00:00.000Z',
      updatedAt: '2026-09-13T09:00:00.000Z',
    },
    {
      id: 'blog-pochampally-ikkat',
      slug: 'pochampally-ikkat-handloom-heritage',
      title: 'పొచంపల్లి చేనేత చీరల కళా వైభవం - చరిత్ర, తయారీ మరియు అంతర్జాతీయ గుర్తింపు',
      excerpt: 'వరల్డ్ టూరిజం విలేజ్ గుర్తింపు పొందిన పొచంపల్లి ఇక్కత్ కళాకారుల ప్రతిభ, జీఐ ట్యాగ్ ప్రాముఖ్యత మరియు చేనేత విశేషాలు.',
      content: `ప్రపంచ ప్రసిద్ధి చెందిన పొచంపల్లి ఇక్కత్ టై-అండ్-డై కళ మన యాదాద్రి ప్రాంతానికే గర్వకారణం.

- శతాబ్దాల సంప్రదాయం కలిగిన ఈ డిజైన్లకు భారత ప్రభుత్వం నుండి జియోగ్రాఫికల్ ఇండికేషన్ (GI) ట్యాగ్ లభించింది.
- సహజ రంగులు, స్వచ్ఛమైన పట్టు మరియు నూలుతో నేసిన వస్త్రాలు నాణ్యతకు మారుపేరు.
- స్థానిక చేనేత సహకార సంఘాలు మరియు నేతన్నలను ప్రోత్సహించడం ద్వారా మన సంస్కృతిని కాపాడుకుందాం.`,
      coverImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&auto=format&fit=crop&q=80',
      category: 'Culture & Arts',
      tags: ['Pochampally', 'Ikkat', 'Handloom', 'Heritage'],
      isPublished: true,
      publishedAt: '2026-09-11T10:00:00.000Z',
      authorId: 'cms0du1m40000v32slild2p1s',
      author: { name: 'Heritage Desk' },
      tenantId: null,
      createdAt: '2026-09-11T10:00:00.000Z',
      updatedAt: '2026-09-11T10:00:00.000Z',
    },
  ]
}

export function getOfflineNewsBySlug(slug: string): any | null {
  const all = getOfflineNews()
  return all.find((n) => n.slug === slug || n.id === slug) || null
}

export function getOfflineBlogBySlug(slug: string): any | null {
  const all = getOfflineBlogs()
  return all.find((b) => b.slug === slug || b.id === slug) || null
}

export interface OfflineUser {
  id: string
  name: string | null
  email: string | null
  username: string | null
  phone: string | null
  passwordHash: string | null
  role: string
  planTier: string
  planExpiresAt: Date | null
  villageId: string | null
  bio: string | null
  image: string | null
  coverImage: string | null
  isPublic: boolean
  isBanned: boolean
  createdAt: Date
  updatedAt: Date
  facebookUrl?: string | null
  instagramUrl?: string | null
  youtubeUrl?: string | null
  twitterUrl?: string | null
}

const DEFAULT_DEMO_USERS: OfflineUser[] = [
  {
    id: 'cms0du1m40000v32slild2p1s',
    name: 'Super Admin',
    email: 'admin@choutuppal.in',
    username: 'admin',
    phone: '9494348175',
    passwordHash: '$2b$10$eKgBR72xp3KfFQMMGtD/1edRXRft8EmWoxePGQ1ukYtpabWVBneoO', // Admin@123 / 123456
    role: 'ADMIN',
    planTier: 'PREMIUM',
    planExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    villageId: 'cmsepb40r0000jv04tdwwd5cw',
    bio: 'Official administrator and community lead for Choutuppal App.',
    image: 'https://i.ibb.co/BVdvN5rB/Untitled-design-removebg-preview.png',
    coverImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
    isPublic: true,
    isBanned: false,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date(),
  },
  {
    id: 'cms0du1m40000v32slild2p1s_alt',
    name: 'Choutuppal Admin',
    email: 'choutuppalapp@gmail.com',
    username: 'choutuppalapp',
    phone: '9494348175',
    passwordHash: '$2b$10$eKgBR72xp3KfFQMMGtD/1edRXRft8EmWoxePGQ1ukYtpabWVBneoO', // 123456
    role: 'ADMIN',
    planTier: 'PREMIUM',
    planExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    villageId: 'cmsepb40r0000jv04tdwwd5cw',
    bio: 'Official administrator and community lead for Choutuppal App.',
    image: 'https://i.ibb.co/BVdvN5rB/Untitled-design-removebg-preview.png',
    coverImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
    isPublic: true,
    isBanned: false,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date(),
  },
  {
    id: 'user_choutuppal_member',
    name: 'Choutuppal Citizen',
    email: 'user@choutuppal.in',
    username: 'choutuppal_user',
    phone: '9876543210',
    passwordHash: '$2b$10$eKgBR72xp3KfFQMMGtD/1edRXRft8EmWoxePGQ1ukYtpabWVBneoO', // 123456
    role: 'USER',
    planTier: 'FREE',
    planExpiresAt: null,
    villageId: 'cmsepb40r0000jv04tdwwd5cw',
    bio: 'Local resident & business owner in Choutuppal.',
    image: null,
    coverImage: null,
    isPublic: true,
    isBanned: false,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date(),
  }
]

let offlineUsersStore: OfflineUser[] | null = null

export function getOfflineUsers(): OfflineUser[] {
  if (offlineUsersStore) return offlineUsersStore
  offlineUsersStore = [...DEFAULT_DEMO_USERS]
  return offlineUsersStore
}

export function saveOfflineUser(user: Partial<OfflineUser> & { id?: string }): OfflineUser {
  const users = getOfflineUsers()
  const existingIdx = users.findIndex(
    (u) =>
      (user.id && u.id === user.id) ||
      (user.email && u.email?.toLowerCase() === user.email.toLowerCase()) ||
      (user.phone && u.phone === user.phone) ||
      (user.username && u.username?.toLowerCase() === user.username.toLowerCase())
  )

  const now = new Date()
  if (existingIdx >= 0) {
    const updated = {
      ...users[existingIdx],
      ...user,
      updatedAt: now,
    }
    users[existingIdx] = updated as OfflineUser
    return updated as OfflineUser
  }

  const newUser: OfflineUser = {
    id: user.id || `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: user.name || 'Citizen',
    email: user.email || null,
    username: user.username || `user_${Math.random().toString(36).substring(2, 7)}`,
    phone: user.phone || null,
    passwordHash: user.passwordHash || null,
    role: user.role || 'USER',
    planTier: user.planTier || 'FREE',
    planExpiresAt: user.planExpiresAt || null,
    villageId: user.villageId || 'cmsepb40r0000jv04tdwwd5cw',
    bio: user.bio || null,
    image: user.image || null,
    coverImage: user.coverImage || null,
    isPublic: user.isPublic ?? true,
    isBanned: user.isBanned ?? false,
    createdAt: now,
    updatedAt: now,
    facebookUrl: user.facebookUrl || null,
    instagramUrl: user.instagramUrl || null,
    youtubeUrl: user.youtubeUrl || null,
    twitterUrl: user.twitterUrl || null,
  }

  users.push(newUser)
  return newUser
}



