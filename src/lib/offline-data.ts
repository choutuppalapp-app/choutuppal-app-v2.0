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

const DEFAULT_OFFLINE_LISTINGS: OfflineListing[] = []

export function getOfflineListings(): OfflineListing[] {
  return []
}

export function getOfflineListingById(id: string): OfflineListing | null {
  return null
}

export function getOfflineListingBySlug(slug: string): OfflineListing | null {
  return null
}

export function getOfflineCategories(): ServiceCategory[] {
  if (cachedCategories) return cachedCategories
  cachedCategories = STANDARD_CATEGORIES
  return cachedCategories
}

export function getOfflineVillages(): any[] {
  if (cachedVillages) return cachedVillages
  cachedVillages = [
    {
      id: 'cmsepb40r0000jv04tdwwd5cw',
      name: 'Choutuppal',
      slug: 'choutuppal',
    },
  ]
  return cachedVillages
}

export function getOfflineSettings(): any[] {
  return [
    { key: 'spin_enabled', value: 'true' },
    { key: 'pricing_free', value: 'true' },
    { key: 'banner_free', value: 'true' },
    { key: 'ads_paid', value: 'false' },
    { key: 'banner_price', value: '99' },
    { key: 'announcement_ticker', value: '' },
    { key: 'ticker_items_json', value: '[]' },
    { key: 'hero_title', value: 'చౌటుప్పల్ సూపర్ యాప్' },
    { key: 'hero_subtitle', value: 'మీ పట్టణం, మీ వ్యాపారాలు - అన్నీ ఒకే యాప్‌లో' },
    { key: 'hero_bg_image', value: 'https://68eqkurg5him9yb0.public.blob.vercel-storage.com/choutuppal-uploads/migrated-1790058158931-hero-banner.webp' },
  ]
}

const OFFLINE_NEWS_ARTICLES = [
  {
    id: 'news-1',
    slug: 'choutuppal-nh65-highway-expansion-update',
    title: 'చౌటుప్పల్ - హైదరాబాద్ జాతీయ రహదారి 65 విస్తరణ పనులు ముమ్మరం',
    summary: 'హైదరాబాద్-విజయవాడ జాతీయ రహదారిపై ట్రాఫిక్ సమస్యల నివారణకు అండర్‌పాస్ మరియు ఫ్లైఓవర్ పనులు వేగవంతం చేశారు.',
    content: `
      <h2>జాతీయ రహదారి 65 విస్తరణ తాజా సమాచారం</h2>
      <p>హైదరాబాద్ - విజయవాడ 65వ నంబర్ జాతీయ రహదారి (NH 65) విస్తరణ పనులు చౌటుప్పల్ పరిధిలో శరవేగంగా కొనసాగుతున్నాయి. నిత్యం వేలాది వాహనాల రాకపోకలతో రద్దీగా ఉండే చౌటుప్పల్ జంక్షన్ వద్ద ట్రాఫిక్ సమస్యలను అధిగమించడానికి నూతన ఫ్లైఓవర్ మరియు సర్వీస్ రోడ్లను పూర్తిస్థాయిలో అభివృద్ధి చేస్తున్నారు.</p>
      
      <h3>ప్రధాన ముఖ్యాంశాలు:</h3>
      <ul>
        <li>చౌటుప్పల్ బస్టాండ్ నుండి తూప్రాన్‌పేట్ వరకు రోడ్డు విస్తరణ పనులు.</li>
        <li>స్థానిక వాహనాల సురక్షిత ప్రయాణానికి ప్రత్యేక అండర్‌పాస్‌లు మరియు ఫుట్‌పాత్‌లు.</li>
        <li>రాత్రి వేళల్లో మెరుగైన వెలుతురు కోసం అధునాతన LED లైటింగ్‌ల ఏర్పాటు.</li>
      </ul>

      <p>ఈ పనులు పూర్తి కావడం వల్ల చౌటుప్పల్ నుండి హైదరాబాద్ మరియు సూర్యాపేట ప్రయాణ సమయం గణనీయంగా తగ్గనుంది. స్థానిక వ్యాపారులకు మరియు ప్రజలకు ఎంతో సౌకర్యంగా ఉండనుంది.</p>
    `,
    image: 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&w=1200&q=80',
    tags: ['NH65', 'Choutuppal', 'Development', 'Roads', 'Telangana'],
    isPublished: true,
    views: 1240,
    createdAt: new Date('2026-03-15T09:00:00Z'),
    updatedAt: new Date('2026-03-15T09:00:00Z'),
    author: { name: 'చౌటుప్పల్ న్యూస్ డెస్క్' },
  },
  {
    id: 'news-2',
    slug: 'choutuppal-new-drinking-water-project',
    title: 'చౌటుప్పల్ మున్సిపాలిటీలో కొత్త తాగునీటి ప్రాజెక్ట్ ప్రారంభం',
    summary: 'ప్రతి వార్డుకు నిరంతర శుద్ధ జలాల సరఫరా కోసం నూతన పైప్‌లైన్ మరియు స్టోరేజ్ ట్యాంక్ పనులు ప్రారంభమయ్యాయి.',
    content: `
      <h2>శుద్ధ తాగునీటి సరఫరా లక్ష్యంగా నూతన పనులు</h2>
      <p>చౌటుప్పల్ మున్సిపాలిటీ పరిధిలోని అన్ని వార్డులలో నిరంతరాయంగా రక్షిత మంచినీరు అందించేందుకు మున్సిపల్ అధికారులు ప్రత్యేక కార్యాచరణ చేపట్టారు. నూతన ఓవర్‌హెడ్ ట్యాంకులు మరియు ఆధునిక పైప్‌లైన్ల అనుసంధాన పనులను ప్రారంభించారు.</p>

      <h3>ప్రాజెక్టు విశేషాలు:</h3>
      <ul>
        <li>అన్ని కాలనీలకు ప్రతిరోజూ నిర్దిష్ట సమయాలలో శుద్ధ తాగునీరు.</li>
        <li>నీటి లీకేజీలను అరికట్టేందుకు డిజిటల్ ఫ్లో మీటర్ల వ్యవస్థ.</li>
        <li>వేసవి కాలంలో నీటి ఎద్దడి రాకుండా ముందస్తు చర్యలు.</li>
      </ul>
    `,
    image: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=1200&q=80',
    tags: ['Water', 'Municipality', 'Choutuppal', 'Development'],
    isPublished: true,
    views: 940,
    createdAt: new Date('2026-03-14T09:00:00Z'),
    updatedAt: new Date('2026-03-14T09:00:00Z'),
    author: { name: 'మున్సిపల్ కరస్పాండెంట్' },
  },
  {
    id: 'news-3',
    slug: 'yadadri-farmers-seeds-distribution',
    title: 'యాదాద్రి భువనగిరి జిల్లా రైతులకు ఉచిత విత్తనాల పంపిణీ',
    summary: 'వ్యవసాయ శాఖ ఆధ్వర్యంలో రైతులకు రాయితీ ఎరువులు మరియు నాణ్యమైన విత్తనాల పంపిణీ కేంద్రాలను ఏర్పాటు చేశారు.',
    content: `
      <h2>రైతులకు పూర్తి మద్దతు - నూతన కొనుగోలు కేంద్రాలు</h2>
      <p>చౌటుప్పల్ మండలంలోని రైతుల కోసం వ్యవసాయ మార్కెట్ కమిటీ ఆధ్వర్యంలో నూతన ధాన్యం మరియు పత్తి కొనుగోలు కేంద్రాలను ప్రారంభించారు. రైతులకు మద్దతు ధర కల్పిస్తూ ఎటువంటి దళారీల ప్రమేయం లేకుండా నేరుగా వారి ఖాతాల్లోకి నగదు జమ అయ్యేలా ఏర్పాట్లు చేశారు.</p>

      <h3>సౌకర్యాలు:</h3>
      <ul>
        <li>తేమ శాతం కొలిచే అధునాతన డిజిటల్ మీటర్ల ఏర్పాటు.</li>
        <li>తాగునీరు, విశ్రాంతి గదులు మరియు ఉచిత భోజన వసతి.</li>
        <li>రైతులకు తక్షణ రసీదులు మరియు ఆన్‌లైన్ పేమెంట్ ట్రాకింగ్.</li>
      </ul>
    `,
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1200&q=80',
    tags: ['Agriculture', 'Farmers', 'Choutuppal', 'Market'],
    isPublished: true,
    views: 890,
    createdAt: new Date('2026-03-12T10:30:00Z'),
    updatedAt: new Date('2026-03-12T10:30:00Z'),
    author: { name: 'అగ్రికల్చర్ డెస్క్' },
  },
  {
    id: 'news-4',
    slug: 'choutuppal-digital-business-registration-launch',
    title: 'చౌటుప్పల్ స్థానిక వ్యాపారులకు డిజిటల్ రిజిస్ట్రేషన్ అవకాశం',
    summary: 'చౌటుప్పల్ యాప్ ద్వారా చిన్న, పెద్ద వ్యాపారాలు ఉచితంగా ఆన్‌లైన్‌లో లిస్టింగ్ చేసుకోవచ్చని నిర్వాహకులు తెలిపారు.',
    content: `
      <h2>స్థానిక దుకాణాలకు నూతన డిజిటల్ ఊతం</h2>
      <p>చౌటుప్పల్ మండలంలోని ప్రతి చిన్న వ్యాపారం, హోటల్, మెడికల్ షాపు మరియు సర్వీస్ ప్రొవైడర్లకు డిజిటల్ గుర్తింపు కల్పించేందుకు చౌటుప్పల్ సూపర్ యాప్ ఉచిత రిజిస్ట్రేషన్ అవకాశాన్ని ప్రారంభించింది.</p>
      
      <p>యాప్ ద్వారా షాపు వివరాలు, ఫోన్ నంబర్లు, గూగుల్ మ్యాప్ లొకేషన్ మరియు ఫోటోలను యాడ్ చేసి నేరుగా కస్టమర్లతో కనెక్ట్ అవ్వవచ్చు.</p>
    `,
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80',
    tags: ['Business', 'SuperApp', 'Choutuppal', 'Digital'],
    isPublished: true,
    views: 1100,
    createdAt: new Date('2026-03-10T11:00:00Z'),
    updatedAt: new Date('2026-03-10T11:00:00Z'),
    author: { name: 'చౌటుప్పల్ బిజినెస్ డెస్క్' },
  },
  {
    id: 'news-health-camps-yadadri',
    slug: 'free-mega-health-camp-choutuppal-community-hall',
    title: 'చౌటుప్పల్ కమ్యూనిటీ హాల్‌లో ఉచిత మెగా హెల్త్ క్యాంప్ - ఉచిత మందుల పంపిణీ',
    summary: 'ప్రముఖ వైద్య నిపుణులతో సాధారణ, గుండె, కంటి మరియు రక్త పరీక్షల ఉచిత నిర్వహణ.',
    content: `
      <h2>ఉచిత వైద్య శిబిరం వివరాలు</h2>
      <p>చౌటుప్పల్ పట్టణ కేంద్రంలోని కమ్యూనిటీ హాల్‌లో ఈ ఆదివారం ఉచిత మెగా వైద్య శిబిరం నిర్వహించనున్నారు. హైదరాబాద్‌కు చెందిన ప్రముఖ ఆసుపత్రుల వైద్య నిపుణులు పాల్గొని ప్రజలకు ఉచితంగా వైద్య సేవలు అందించనున్నారు.</p>

      <h3>అందుబాటులో ఉండే పరీక్షలు:</h3>
      <ul>
        <li>బిపి, షుగర్ మరియు సాధారణ రక్త పరీక్షలు (Complete Blood Picture).</li>
        <li>ఈసీజీ (ECG) మరియు గుండె సంబంధిత ప్రాథమిక పరీక్షలు.</li>
        <li>కంటి పరీక్షలు మరియు ఉచిత రీడింగ్ గ్లాసుల పంపిణీ.</li>
        <li>ఉచితంగా అవసరమైన ప్రాథమిక మందుల పంపిణీ.</li>
      </ul>

      <p>ఈ అవకాశాన్ని చౌటుప్పల్ మండల ప్రజలు, వృద్ధులు మరియు మహిళలు సద్వినియోగం చేసుకోవాలని నిర్వాహకులు కోరారు.</p>
    `,
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
    tags: ['Health', 'MedicalCamp', 'Choutuppal', 'FreeServices'],
    isPublished: true,
    views: 650,
    createdAt: new Date('2026-03-08T14:00:00Z'),
    updatedAt: new Date('2026-03-08T14:00:00Z'),
    author: { name: 'హెల్త్ రిపోర్టర్' },
  },
]

const OFFLINE_BLOG_POSTS = [
  {
    id: 'blog-1',
    slug: '5-things-to-know-before-buying-plots-in-choutuppal',
    title: 'చౌటుప్పల్ పరిసరాల్లో ఓపెన్ ప్లాట్లు కొనేముందు తెలుసుకోవాల్సిన 5 విషయాలు',
    excerpt: 'హెచ్‌ఎండిఏ/డిటిసిపి లేఅవుట్ అనుమతులు, లింక్ డాక్యుమెంట్లు మరియు ఫ్యూచర్ గ్రోత్ విశ్లేషణ పూర్తి గైడ్.',
    content: `
      <h2>చౌటుప్పల్ రియల్ ఎస్టేట్ మార్కెట్ ఎందుకు దూసుకుపోతోంది?</h2>
      <p>తెలంగాణ రాష్ట్రంలో వేగంగా అభివృద్ధి చెందుతున్న ముఖ్యమైన పట్టణాల్లో చౌటుప్పల్ ఒకటి. హైదరాబాద్ మహానగరానికి అతి చేరువలో ఉండటం, రీజినల్ రింగ్ రోడ్ (RRR) ప్రతిపాదిత అలైన్‌మెంట్ మరియు జాతీయ రహదారి 65 ఉండటం వల్ల ఇక్కడ స్థలాల కొనుగోలుకు విపరీతమైన డిమాండ్ ఏర్పడింది.</p>

      <h3>పెట్టుబడికి ముఖ్య కారణాలు:</h3>
      <ol>
        <li><strong>రవాణా సౌకర్యం:</strong> హైదరాబాద్ ఎల్బీనగర్ లేదా ఉప్పల్ నుండి 45 నిమిషాల్లో చేరుకోగల అద్భుతమైన రోడ్డు నెట్‌వర్క్.</li>
        <li><strong>పరిశ్రమల ఏర్పాటు:</strong> ఫార్మా, టెక్స్‌టైల్ మరియు లాజిస్టిక్స్ హబ్‌ల విస్తరణతో వేలాది ఉద్యోగావకాశాలు.</li>
        <li><strong>మౌలిక వసతులు:</strong> విద్యాసంస్థలు, ఆసుపత్రులు మరియు వాణిజ్య సముదాయాలు శరవేగంగా ఏర్పడటం.</li>
      </ol>

      <p>ఓపెన్ ప్లాట్లు లేదా వ్యవసాయ భూములు కొనుగోలు చేయాలనుకునే వారు సరైన పంచాయతీ/DTCP/HMDA అనుమతులు ఉన్న లేఅవుట్‌లను ఎంపిక చేసుకోవడం ఎంతో శ్రేయస్కరం.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
    category: 'Real Estate',
    tags: ['RealEstate', 'Investment', 'Plots', 'Choutuppal', 'Telangana'],
    isPublished: true,
    views: 2150,
    createdAt: new Date('2026-03-14T08:00:00Z'),
    updatedAt: new Date('2026-03-14T08:00:00Z'),
    author: { name: 'రియల్ ఎస్టేట్ ఎక్స్‌పర్ట్' },
  },
  {
    id: 'blog-2',
    slug: 'how-to-grow-local-business-digitally-in-choutuppal',
    title: 'స్థానిక దుకాణాన్ని డిజిటల్ బిజినెస్‌గా ఎలా మార్చాలి?',
    excerpt: 'వాట్సాప్ కాటలాగ్, ఆన్‌లైన్ లిస్టింగ్స్ మరియు సోషల్ మీడియా ద్వారా కస్టమర్లను ఎలా ఆకర్షించవచ్చో తెలుసుకోండి.',
    content: `
      <h2>డిజిటల్ చౌటుప్పల్ - స్థానిక వ్యాపారులకు స్వర్ణావకాశం</h2>
      <p>నేటి సాంకేతిక యుగంలో ప్రజలు తమకు కావలసిన వస్తువులు లేదా సర్వీసుల కోసం ముందుగా మొబైల్ ఫోన్లలోనే శోధిస్తున్నారు. చౌటుప్పల్ సూపర్ యాప్ ద్వారా స్థానిక వ్యాపారులు తమ కస్టమర్లను నేరుగా చేరుకోవచ్చు.</p>

      <h3>మీ షాపును విజయవంతం చేసుకోవడానికి 4 సూత్రాలు:</h3>
      <ul>
        <li><strong>పూర్తి వివరాలు నమోదు చేయండి:</strong> షాపు పేరు, సరైన ఫోన్ నంబర్ మరియు వాట్సాప్ నంబర్ ఇవ్వండి.</li>
        <li><strong>క్లియర్ ఫోటోలు అప్‌లోడ్ చేయండి:</strong> మీ షాపు బోర్డు మరియు లభించే వస్తువుల ఫోటోలు కస్టమర్లలో నమ్మకాన్ని పెంచుతాయి.</li>
        <li><strong>ఆఫర్లు & స్టోరీలు పంచుకోండి:</strong> పండుగలు మరియు ప్రత్యేక రోజుల్లో డిస్కౌంట్ ఆఫర్లను యాప్ స్టోరీస్ ద్వారా ప్రచారం చేయండి.</li>
        <li><strong>రివ్యూలు & రేటింగ్‌లు పొందండి:</strong> సంతృప్తి చెందిన కస్టమర్ల నుండి రేటింగ్స్ తీసుకోవడం ద్వారా ఎక్కువ మంది కొత్త కస్టమర్లు వస్తారు.</li>
      </ul>

      <p>ఇప్పుడే మీ వ్యాపారాన్ని చౌటుప్పల్ సూపర్ యాప్‌లో ఉచితంగా లేదా ప్రీమియంగా లిస్ట్ చేసి మీ అమ్మకాలను పెంచుకోండి!</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    category: 'Business',
    tags: ['Business', 'SuperApp', 'DigitalMarketing', 'Choutuppal'],
    isPublished: true,
    views: 1840,
    createdAt: new Date('2026-03-11T11:00:00Z'),
    updatedAt: new Date('2026-03-11T11:00:00Z'),
    author: { name: 'డిజిటల్ సలహాదారు' },
  },
  {
    id: 'blog-3',
    slug: 'top-places-to-visit-near-choutuppal',
    title: 'చౌటుప్పల్ సమీపంలోని ప్రముఖ ఆధ్యాత్మిక మరియు చారిత్రక ప్రదేశాలు',
    excerpt: 'యాదాద్రి శ్రీ లక్ష్మీ నరసింహ స్వామి క్షేత్రం, కొలనుపాక జైన మందిరం మరియు పర్యాటక విశేషాలు.',
    content: `
      <h2>చౌటుప్పల్ పరిసర పర్యాటక ప్రదేశాలు</h2>
      <p>చౌటుప్పల్ పట్టణానికి సమీపంలో అనేక ప్రసిద్ధ పుణ్యక్షేత్రాలు మరియు చారిత్రక ప్రదేశాలు ఉన్నాయి. వీకెండ్‌లో కుటుంబ సమేతంగా సందర్శించడానికి ఇవి ఉత్తమ గమ్యస్థానాలు.</p>

      <h3>ముఖ్యమైన ప్రదేశాలు:</h3>
      <ul>
        <li><strong>యాదాద్రి శ్రీ లక్ష్మీ నరసింహ స్వామి దేవాలయం:</strong> తెలంగాణలోనే అత్యంత ప్రతిష్టాత్మకమైన ఆధ్యాత్మిక క్షేత్రం, అద్భుతమైన శిల్పకళ.</li>
        <li><strong>కొలనుపాక జైన మందిరం:</strong> 2000 సంవత్సరాల పురాతన జైన తీర్థంకరుల ఆలయం.</li>
        <li><strong>భోంగీర్ కోట (Bhongir Fort):</strong> సాహస ప్రియుల కోసం ట్రెక్కింగ్ మరియు రాతికోట వీక్షణ.</li>
      </ul>
    `,
    coverImage: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
    category: 'Travel & Tourism',
    tags: ['Tourism', 'Yadadri', 'Choutuppal', 'PlacesToVisit'],
    isPublished: true,
    views: 1450,
    createdAt: new Date('2026-03-09T08:00:00Z'),
    updatedAt: new Date('2026-03-09T08:00:00Z'),
    author: { name: 'టూరిజం గైడ్' },
  },
  {
    id: 'blog-4',
    slug: 'future-of-real-estate-in-hyderabad-vijayawada-corridor',
    title: 'హైదరాబాద్ - విజయవాడ కారిడార్‌లో రియల్ ఎస్టేట్ గ్రోత్ భవిష్యత్తు',
    excerpt: 'రీజినల్ రింగ్ రోడ్ (RRR), ఇండస్ట్రియల్ హబ్స్ మరియు ఫార్మా సిటీ అనుసంధానంతో ప్రాపర్టీ విలువల పెరుగుదల.',
    content: `
      <h2>హైదరాబాద్ - విజయవాడ హైవే గ్రోత్ కారిడార్</h2>
      <p>హైదరాబాద్ - విజయవాడ ఎక్స్‌ప్రెస్‌వే భవిష్యత్ తెలంగాణ ఆర్థిక ప్రగతికి అత్యంత కీలకమైన మార్గంగా మారింది. చౌటుప్పల్ సెంట్రల్ నోడ్ గా మారి పారిశ్రామిక మరియు రెసిడెన్షియల్ ప్రాజెక్ట్‌లకు కేరాఫ్ అడ్రస్‌గా నిలుస్తోంది.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    category: 'Real Estate',
    tags: ['RealEstate', 'Corridor', 'NH65', 'Choutuppal'],
    isPublished: true,
    views: 1320,
    createdAt: new Date('2026-03-07T12:00:00Z'),
    updatedAt: new Date('2026-03-07T12:00:00Z'),
    author: { name: 'ఇన్వెస్ట్‌మెంట్ అనలిస్ట్' },
  },
]

export function getOfflineBanners(): any[] {
  return []
}

export function getOfflineNews(): any[] {
  return OFFLINE_NEWS_ARTICLES
}

export function getOfflineBlogs(): any[] {
  return OFFLINE_BLOG_POSTS
}

export function getOfflineNewsBySlug(slug: string): any | null {
  const cleanSlug = slug.toLowerCase().trim()
  return (
    OFFLINE_NEWS_ARTICLES.find(
      (n) => n.slug.toLowerCase() === cleanSlug || n.id.toLowerCase() === cleanSlug
    ) ||
    OFFLINE_BLOG_POSTS.find(
      (b) => b.slug.toLowerCase() === cleanSlug || b.id.toLowerCase() === cleanSlug
    ) ||
    null
  )
}

export function getOfflineBlogBySlug(slug: string): any | null {
  const cleanSlug = slug.toLowerCase().trim()
  return (
    OFFLINE_BLOG_POSTS.find(
      (b) => b.slug.toLowerCase() === cleanSlug || b.id.toLowerCase() === cleanSlug
    ) ||
    OFFLINE_NEWS_ARTICLES.find(
      (n) => n.slug.toLowerCase() === cleanSlug || n.id.toLowerCase() === cleanSlug
    ) ||
    null
  )
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



