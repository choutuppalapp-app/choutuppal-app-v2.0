import fs from 'fs'
import path from 'path'

export interface OfflineListing {
  id: string
  slug: string
  title: string
  description?: string | null
  type?: string
  status: string
  isFeatured: boolean
  isPremium?: boolean
  coverImage?: string | null
  logo?: string | null
  gallery?: string[]
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
  clicks?: number
  whatsappClicks?: number
  categoryId?: string | null
  villageId?: string | null
  category?: { id: string; name: string; slug: string; icon?: string | null; telugu?: string } | null
  village?: { id: string; name: string; slug: string } | null
  owner?: { id: string; name: string; username?: string; phone?: string | null; email?: string | null; image?: string | null } | null
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
  { id: 'cat-automobile', name: 'Automobile & Garage', slug: 'automobile', icon: 'Car', telugu: 'ఆటోమొబైల్ & గ్యారేజ్', description: 'Auto sales, service centers, spare parts & bike repair' },
  { id: 'cat-services', name: 'Services & Technicians', slug: 'services', icon: 'Wrench', telugu: 'సేవలు & టెక్నీషియన్లు', description: 'Electricians, plumbers, mechanics, AC repair & home services' },
  { id: 'cat-electrical', name: 'Electrical & Hardware', slug: 'electrical-hardware', icon: 'Zap', telugu: 'ఎలక్ట్రికల్ & హార్డ్‌వేర్', description: 'Electrical goods, wiring, motors & hardware tools' },
  { id: 'cat-health', name: 'Health & Medical', slug: 'health-medical', icon: 'HeartPulse', telugu: 'వైద్యం & ఫార్మసీ', description: 'Hospitals, clinics, medical stores & diagnostic centers' },
  { id: 'cat-food', name: 'Food & Dining', slug: 'food-dining', icon: 'UtensilsCrossed', telugu: 'హోటల్స్ & రెస్టారెంట్లు', description: 'Restaurants, tiffin centers, bakeries & sweets' },
  { id: 'cat-internet', name: 'Internet & MeeSeva', slug: 'internet-cyber-cafe', icon: 'Globe', telugu: 'మీసేవ & నెట్ సెంటర్', description: 'MeeSeva, Cyber Cafe, Xerox, online forms & DTP' },
  { id: 'cat-building', name: 'Building Materials', slug: 'building-materials', icon: 'BrickWall', telugu: 'భవన నిర్మాణ సామాగ్రి', description: 'Cement, steel, sand, bricks & construction supply' },
  { id: 'cat-engineering', name: 'Engineering & Welding', slug: 'engineering-welding', icon: 'Flame', telugu: 'ఇంజనీరింగ్ & వెల్డింగ్', description: 'Welding works, fabrication, grill & shutter manufacturing' },
  { id: 'cat-agriculture', name: 'Agriculture & Seeds', slug: 'agriculture', icon: 'Sprout', telugu: 'వ్యవసాయం & ఎరువులు', description: 'Seeds, pesticides, fertilizers & agriculture equipment' },
  { id: 'cat-furniture', name: 'Furniture & Home', slug: 'furniture-home', icon: 'Armchair', telugu: 'ఫర్నిచర్ & డెకార్', description: 'Furniture showrooms, wood works, mattresses & home decor' },
  { id: 'cat-interior', name: 'Interior & Paints', slug: 'interior-decor', icon: 'Paintbrush', telugu: 'ఇంటీరియర్ & పెయింట్స్', description: 'Paints, false ceiling, glass, ACP & interior design' },
  { id: 'cat-retail', name: 'Retail Shopping', slug: 'retail-shopping', icon: 'ShoppingBag', telugu: 'షాపింగ్ & దుస్తులు', description: 'Supermarkets, cloth stores, readymade garments, footwear' },
  { id: 'cat-realestate', name: 'Real Estate & Lands', slug: 'real-estate', icon: 'Home', telugu: 'రియల్ ఎస్టేట్ & ప్లాట్లు', description: 'Open plots, farmland, commercial properties & houses' },
  { id: 'cat-education', name: 'Education & Coaching', slug: 'education', icon: 'GraduationCap', telugu: 'విద్య & కోచింగ్', description: 'Schools, colleges, coaching centers & tuition classes' },
  { id: 'cat-electronics', name: 'Electronics & Mobiles', slug: 'electronics', icon: 'Smartphone', telugu: 'మొబైల్స్ & ఎలక్ట్రానిక్స్', description: 'Smartphones, repairs, computers & home appliances' },
  { id: 'cat-transport', name: 'Transport & Logistics', slug: 'transport', icon: 'Truck', telugu: 'రవాణా & ట్రాన్స్‌పోర్ట్', description: 'Auto, goods transport, tempo, cabs & parcel service' },
]

export const STANDARD_VILLAGES = [
  { id: 'v-choutuppal', name: 'Choutuppal Town', slug: 'choutuppal', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
  { id: 'v-panthangi', name: 'Panthangi', slug: 'panthangi', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
  { id: 'v-malkapur', name: 'Malkapur', slug: 'malkapur', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
  { id: 'v-peddakondur', name: 'Peddakondur', slug: 'peddakondur', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
  { id: 'v-lingojiguda', name: 'Lingoji Guda', slug: 'lingoji-guda', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
  { id: 'v-koyalagudem', name: 'Koyalagudem', slug: 'koyalagudem', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
  { id: 'v-lakkaram', name: 'Lakkaram', slug: 'lakkaram', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
  { id: 'v-tupranpet', name: 'Tupranpet', slug: 'tupranpet', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
  { id: 'v-tallasingaram', name: 'Tallasingaram', slug: 'tallasingaram', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
  { id: 'v-allapur', name: 'Allapur', slug: 'allapur', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
  { id: 'v-chinnakondur', name: 'Chinna Kondur', slug: 'chinna-kondur', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
  { id: 'v-devalamma', name: 'Devalamma Nagaram', slug: 'devalamma-nagaram', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
  { id: 'v-jaikesaram', name: 'Jai Kesaram', slug: 'jai-kesaram', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
  { id: 'v-khairathpur', name: 'Khairathpur', slug: 'khairathpur', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
  { id: 'v-nelapatla', name: 'Nelapatla', slug: 'nelapatla', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
  { id: 'v-peepalpahad', name: 'Peepal Pahad', slug: 'peepal-pahad', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
  { id: 'v-swamulavari', name: 'Swamulavari Lingotam', slug: 'swamulavari-lingotam', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
  { id: 'v-tangadpalle', name: 'Tangad Palle', slug: 'tangad-palle', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
  { id: 'v-yellagiri', name: 'Yellagiri', slug: 'yellagiri', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
]

const SEED_LISTINGS: OfflineListing[] = [
  {
    id: 'ch-feat-1',
    title: 'శ్రీ సాయి ఆటోమొబైల్ సర్వీసెస్ & గ్యారేజ్',
    slug: 'sri-sai-automobile-choutuppal',
    description: 'ఆల్ బైక్ & కార్ రిపేరింగ్, వాషింగ్, ఆయిల్ ఛేంజ్, స్పేర్ పార్ట్స్ మరియు ఎమర్జెన్సీ బ్రేక్‌డౌన్ సర్వీస్. చౌటుప్పల్ లో నంబర్ 1 గ్యారేజ్.',
    type: 'BUSINESS',
    status: 'APPROVED',
    isFeatured: true,
    isPremium: true,
    coverImage: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80',
    phone: '9494348175',
    whatsapp: '9494348175',
    address: 'NH 65 హైవే, బస్టాండ్ దగ్గర, చౌటుప్పల్',
    avgRating: 4.9,
    views: 1420,
    clicks: 340,
    whatsappClicks: 180,
    categoryId: 'cat-automobile',
    villageId: 'v-choutuppal',
    category: { id: 'cat-automobile', name: 'Automobile & Garage', slug: 'automobile', icon: 'Car', telugu: 'ఆటోమొబైల్ & గ్యారేజ్' },
    village: { id: 'v-choutuppal', name: 'Choutuppal Town', slug: 'choutuppal' },
    owner: { id: 'cms0du1m40000v32slild2p1s', name: 'శ్రీనివాస్ రెడ్డి', username: 'admin', phone: '9494348175' },
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-09-24T10:00:00.000Z',
  },
  {
    id: 'ch-feat-2',
    title: 'చౌటుప్పల్ డిజిటల్ మీసేవ & ఇంటర్నెట్ సెంటర్',
    slug: 'choutuppal-meeseva-internet-center',
    description: 'ఆధార్ అప్‌డేట్, పాన్ కార్డ్, పాస్‌పోర్ట్ అప్లికేషన్లు, ప్రభుత్వ ఉద్యోగాల దరఖాస్తులు, కలర్ జిరాక్స్, ల్యామినేషన్ & ఆన్‌లైన్ పేమెంట్స్.',
    type: 'SERVICE',
    status: 'APPROVED',
    isFeatured: true,
    isPremium: true,
    coverImage: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80',
    phone: '9494348175',
    whatsapp: '9494348175',
    address: 'మెయిన్ రోడ్, బ్యాంక్ కాలనీ, చౌటుప్పల్',
    avgRating: 4.8,
    views: 1180,
    clicks: 290,
    whatsappClicks: 140,
    categoryId: 'cat-internet',
    villageId: 'v-choutuppal',
    category: { id: 'cat-internet', name: 'Internet & MeeSeva', slug: 'internet-cyber-cafe', icon: 'Globe', telugu: 'మీసేవ & నెట్ సెంటర్' },
    village: { id: 'v-choutuppal', name: 'Choutuppal Town', slug: 'choutuppal' },
    owner: { id: 'cms0du1m40000v32slild2p1s', name: 'రమేష్ కుమార్', username: 'admin', phone: '9494348175' },
    createdAt: '2026-01-12T10:00:00.000Z',
    updatedAt: '2026-09-24T10:00:00.000Z',
  },
  {
    id: 'ch-feat-3',
    title: 'శ్రీ లక్ష్మి టిఫిన్స్ & ఫ్యామిలీ రెస్టారెంట్',
    slug: 'sri-laxmi-tiffins-choutuppal',
    description: 'రుచికరమైన వేడి వేడి ఇడ్లీ, దోశ, వడ, పూరి, చట్నీలు మరియు మధ్యాహ్నం భోజనం, బిర్యానీ. పరిశుభ్రమైన వాతావరణం, ఫ్యామిలీ సెక్షన్ అందుబాటులో ఉంది.',
    type: 'BUSINESS',
    status: 'APPROVED',
    isFeatured: true,
    isPremium: true,
    coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    phone: '9494348175',
    whatsapp: '9494348175',
    address: 'NH 65 క్రాస్ రోడ్స్, చౌటుప్పల్',
    avgRating: 4.9,
    views: 2350,
    clicks: 580,
    whatsappClicks: 210,
    categoryId: 'cat-food',
    villageId: 'v-choutuppal',
    category: { id: 'cat-food', name: 'Food & Dining', slug: 'food-dining', icon: 'UtensilsCrossed', telugu: 'హోటల్స్ & రెస్టారెంట్లు' },
    village: { id: 'v-choutuppal', name: 'Choutuppal Town', slug: 'choutuppal' },
    owner: { id: 'cms0du1m40000v32slild2p1s', name: 'లక్ష్మయ్య', username: 'admin', phone: '9494348175' },
    createdAt: '2026-01-15T10:00:00.000Z',
    updatedAt: '2026-09-24T10:00:00.000Z',
  },
  {
    id: 'ch-feat-4',
    title: 'బాలాజీ ఎలక్ట్రికల్స్, మోటార్స్ & హార్డ్‌వేర్',
    slug: 'balaji-electricals-choutuppal',
    description: 'అన్ని రకాల సబ్‌మెర్సిబుల్ మోటార్లు, వైరింగ్ కేబుల్స్, పైపులు, స్విచ్‌లు, ఫ్యాన్లు, లైటింగ్స్ మరియు హార్డ్‌వేర్ సామాగ్రి హోల్‌సేల్ & రీటైల్ అమ్మకాలు.',
    type: 'BUSINESS',
    status: 'APPROVED',
    isFeatured: true,
    isPremium: true,
    coverImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    phone: '9494348175',
    whatsapp: '9494348175',
    address: 'గాంధీ చౌక్, చౌటుప్పల్',
    avgRating: 4.7,
    views: 940,
    clicks: 180,
    whatsappClicks: 95,
    categoryId: 'cat-electrical',
    villageId: 'v-choutuppal',
    category: { id: 'cat-electrical', name: 'Electrical & Hardware', slug: 'electrical-hardware', icon: 'Zap', telugu: 'ఎలక్ట్రికల్ & హార్డ్‌వేర్' },
    village: { id: 'v-choutuppal', name: 'Choutuppal Town', slug: 'choutuppal' },
    owner: { id: 'cms0du1m40000v32slild2p1s', name: 'బాలాజీ రావు', username: 'admin', phone: '9494348175' },
    createdAt: '2026-01-18T10:00:00.000Z',
    updatedAt: '2026-09-24T10:00:00.000Z',
  },
  {
    id: 'ch-feat-5',
    title: 'శ్రీ వేంకటేశ్వర మెడికల్ & జనరల్ స్టోర్స్ (24x7)',
    slug: 'sri-venkateshwara-medical-choutuppal',
    description: 'అన్ని రకాల నాణ్యమైన అల్లోపతిక్, ఆయుర్వేదిక్ మందులు, సర్జికల్ వస్తువులు, బేబీ కేర్ ప్రొడక్ట్స్ మరియు 24 గంటల ఎమర్జెన్సీ హోమ్ డెలివరీ.',
    type: 'BUSINESS',
    status: 'APPROVED',
    isFeatured: true,
    isPremium: true,
    coverImage: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    phone: '9494348175',
    whatsapp: '9494348175',
    address: 'గవర్నమెంట్ హాస్పిటల్ రోడ్, చౌటుప్పల్',
    avgRating: 4.9,
    views: 1650,
    clicks: 410,
    whatsappClicks: 190,
    categoryId: 'cat-health',
    villageId: 'v-choutuppal',
    category: { id: 'cat-health', name: 'Health & Medical', slug: 'health-medical', icon: 'HeartPulse', telugu: 'వైద్యం & ఫార్మసీ' },
    village: { id: 'v-choutuppal', name: 'Choutuppal Town', slug: 'choutuppal' },
    owner: { id: 'cms0du1m40000v32slild2p1s', name: 'డాక్టర్ సురేష్', username: 'admin', phone: '9494348175' },
    createdAt: '2026-01-20T10:00:00.000Z',
    updatedAt: '2026-09-24T10:00:00.000Z',
  },
  {
    id: 'ch-feat-6',
    title: 'మహా లక్ష్మి బిల్డింగ్ మెటీరియల్స్ & సిమెంట్ సప్లయర్స్',
    slug: 'maha-laxmi-building-materials-choutuppal',
    description: 'అల్ట్రాటెక్ సిమెంట్, టాటా టిస్కాన్ స్టీల్, ఇసుక, కంకర, రెడ్ బ్రిక్స్ మరియు బిల్డింగ్ కన్‌స్ట్రక్షన్ మెటీరియల్స్ హోల్‌సేల్ సప్లై.',
    type: 'BUSINESS',
    status: 'APPROVED',
    isFeatured: false,
    isPremium: true,
    coverImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    phone: '9494348175',
    whatsapp: '9494348175',
    address: 'పంతంగి రోడ్, చౌటుప్పల్',
    avgRating: 4.8,
    views: 820,
    clicks: 160,
    whatsappClicks: 85,
    categoryId: 'cat-building',
    villageId: 'v-panthangi',
    category: { id: 'cat-building', name: 'Building Materials', slug: 'building-materials', icon: 'BrickWall', telugu: 'భవన నిర్మాణ సామాగ్రి' },
    village: { id: 'v-panthangi', name: 'Panthangi', slug: 'panthangi' },
    owner: { id: 'cms0du1m40000v32slild2p1s', name: 'వెంకటయ్య గౌడ్', username: 'admin', phone: '9494348175' },
    createdAt: '2026-01-22T10:00:00.000Z',
    updatedAt: '2026-09-24T10:00:00.000Z',
  },
]

export interface OfflineRealEstate {
  id: string
  title: string
  slug: string
  description?: string | null
  price: number
  negotiable?: boolean
  type: string
  listingType: string
  bedrooms?: number | null
  bathrooms?: number | null
  areaSqft?: number | null
  coverImage?: string | null
  images?: string[]
  address: string
  contactPhone: string
  contactWhatsapp?: string | null
  status: string
  views: number
  villageId: string
  village?: any
  createdAt: string
  updatedAt?: string
}

const SEED_REAL_ESTATES: OfflineRealEstate[] = [
  {
    id: 're-1',
    title: 'హైవే ఫేసింగ్ ఓపెన్ ప్లాట్లు (HMDA / DTCP Approved)',
    slug: 'highway-facing-open-plots-choutuppal',
    description: 'NH 65 హైదరాబాద్-విజయవాడ హైవే ఫేసింగ్ లో 150 & 200 గజాల అద్భుతమైన రెసిడెన్షియల్ ఓపెన్ ప్లాట్లు. 100% క్లియర్ టైటిల్, స్పాట్ రిజిస్ట్రేషన్ మరియు బ్యాంక్ లోన్ సదుపాయం కలదు.',
    price: 1500000,
    negotiable: true,
    type: 'PLOT',
    listingType: 'SALE',
    bedrooms: null,
    bathrooms: null,
    areaSqft: 1800,
    coverImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
    address: 'హైవే జంక్షన్, చౌటుప్పల్ టౌన్',
    contactPhone: '9494348175',
    contactWhatsapp: '9494348175',
    status: 'APPROVED',
    views: 1240,
    villageId: 'v-choutuppal',
    village: { id: 'v-choutuppal', name: 'Choutuppal Town', slug: 'choutuppal' },
    createdAt: '2026-01-15T10:00:00.000Z',
  },
  {
    id: 're-2',
    title: '2BHK ఇండిపెండెంట్ లగ్జరీ హౌస్ అమ్మకానికి',
    slug: '2bhk-independent-luxury-house-lingojiguda',
    description: '150 గజాల విస్తీర్ణంలో నూతనంగా నిర్మించిన 2BHK ఇండిపెండెంట్ హౌస్. 100% వాస్తు, బోరు వాటర్, కార్ పార్కింగ్ మరియు ప్రశాంతమైన వాతావరణం.',
    price: 4200000,
    negotiable: true,
    type: 'HOUSE',
    listingType: 'SALE',
    bedrooms: 2,
    bathrooms: 2,
    areaSqft: 1350,
    coverImage: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
    address: 'లింగోజిగూడ రోడ్, చౌటుప్పల్',
    contactPhone: '9494348175',
    contactWhatsapp: '9494348175',
    status: 'APPROVED',
    views: 980,
    villageId: 'v-lingojiguda',
    village: { id: 'v-lingojiguda', name: 'Lingoji Guda', slug: 'lingoji-guda' },
    createdAt: '2026-01-20T10:00:00.000Z',
  },
]

export const INITIAL_OFFLINE_LISTINGS = SEED_LISTINGS

// ============================================================================
// PERSISTENT JSON FILE STORE ENGINE
// ============================================================================

const STORE_FILE_PATH = path.join(process.cwd(), 'src/data/db-store.json')
const FALLBACK_STORE_FILE_PATH = path.join(process.cwd(), 'data/db-store.json')

interface DbStoreData {
  listings: OfflineListing[]
  realEstates: OfflineRealEstate[]
  banners: any[]
  stories: any[]
  shorts: any[]
  news: any[]
  blogs: any[]
  settings: any[]
  users: any[]
  lastUpdated: string
}

let memoryStore: DbStoreData | null = null

function getStorageFilePath(): string {
  try {
    const dir = path.dirname(STORE_FILE_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    return STORE_FILE_PATH
  } catch {
    const fallbackDir = path.dirname(FALLBACK_STORE_FILE_PATH)
    if (!fs.existsSync(fallbackDir)) {
      fs.mkdirSync(fallbackDir, { recursive: true })
    }
    return FALLBACK_STORE_FILE_PATH
  }
}

function loadStoreFromDisk(): DbStoreData {
  if (memoryStore) return memoryStore

  const filePath = getStorageFilePath()
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8')
      const parsed = JSON.parse(raw)
      if (parsed && Array.isArray(parsed.listings)) {
        memoryStore = parsed
        return memoryStore!
      }
    }
  } catch (err) {
    console.warn('[OfflineStore] Failed to read disk store, re-initializing:', err)
  }

  // Initialize with seed data
  memoryStore = {
    listings: [...SEED_LISTINGS],
    realEstates: [...SEED_REAL_ESTATES],
    banners: [
      {
        id: 'banner_1',
        title: 'చౌటుప్పల్ బిజినెస్ ఎక్స్‌పో 2026',
        imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
        link: '/explore',
        position: 'HOME_TOP',
        status: 'APPROVED',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ],
    stories: [
      {
        id: 'story_1',
        caption: 'చౌటుప్పల్ సూపర్ యాప్ — వ్యాపారాలు & సేవలు',
        mediaUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
        mediaType: 'IMAGE',
        link: '/explore',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ],
    shorts: [
      {
        id: 'short_1',
        title: 'చౌటుప్పల్ హైవే డెవలప్‌మెంట్ డ్రోన్ వీడియో',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        youtubeId: 'dQw4w9WgXcQ',
        thumbnail: 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&w=600&q=80',
        views: 1240,
        likes: 180,
        createdAt: new Date().toISOString(),
      },
    ],
    news: [
      {
        id: 'news-1',
        title: 'చౌటుప్పల్ - హైదరాబాద్ జాతీయ రహదారి 65 విస్తరణ పనులు ముమ్మరం',
        slug: 'choutuppal-nh65-highway-expansion-update',
        summary: 'హైదరాబాద్-విజయవాడ జాతీయ రహదారిపై ట్రాఫిక్ సమస్యల నివారణకు అండర్‌పాస్ మరియు ఫ్లైఓవర్ పనులు వేగవంతం చేశారు.',
        content: 'హైదరాబాద్-విజయవాడ జాతీయ రహదారిపై ట్రాఫిక్ సమస్యల నివారణకు అండర్‌పాస్ మరియు ఫ్లైఓవర్ పనులు వేగవంతం చేశారు. స్థానిక ప్రజలకు మరియు వాహనదారులకు సురక్షితమైన ప్రయాణం కల్పించడానికి అధికారులు చర్యలు చేపట్టారు.',
        image: 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&w=800&q=80',
        tags: ['Choutuppal', 'NH65', 'Development'],
        isPublished: true,
        views: 890,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: { name: 'చౌటుప్పల్ న్యూస్ డెస్క్' },
      },
    ],
    blogs: [
      {
        id: 'blog-1',
        title: 'చౌటుప్పల్ పరిసరాల్లో ఓపెన్ ప్లాట్లు కొనేముందు తెలుసుకోవాల్సిన 5 విషయాలు',
        slug: '5-things-to-know-before-buying-plots-in-choutuppal',
        excerpt: 'హెచ్‌ఎండిఏ/డిటిసిపి లేఅవుట్ అనుమతులు, లింక్ డాక్యుమెంట్లు మరియు ఫ్యూచర్ గ్రోత్ విశ్లేషణ పూర్తి గైడ్.',
        content: 'హెచ్‌ఎండిఏ/డిటిసిపి లేఅవుట్ అనుమతులు, లింక్ డాక్యుమెంట్లు మరియు ఫ్యూచర్ గ్రోత్ విశ్లేషణ పూర్తి గైడ్. పెట్టుబడి పెట్టే ముందు సరైన పత్రాలు ఎలా సరిచూసుకోవాలో తెలుసుకోండి.',
        coverImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
        category: 'Real Estate',
        tags: ['Real Estate', 'Choutuppal', 'Investment'],
        isPublished: true,
        views: 650,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: { name: 'చౌటుప్పల్ బ్లాగ్ డెస్క్' },
      },
    ],
    settings: [
      { key: 'spin_enabled', value: 'true' },
      { key: 'pricing_free', value: 'true' },
      { key: 'banner_free', value: 'true' },
      { key: 'ads_paid', value: 'false' },
      { key: 'banner_price', value: '99' },
      { key: 'announcement_ticker', value: 'చౌటుప్పల్ సూపర్ యాప్‌లోకి స్వాగతం! మీ షాపును ఉచితంగా నమోదు చేసుకోండి.' },
      { key: 'hero_title', value: 'చౌటుప్పల్ సూపర్ యాప్' },
      { key: 'hero_subtitle', value: 'మీ పట్టణం, మీ వ్యాపారాలు - అన్నీ ఒకే యాప్‌లో' },
      { key: 'hero_bg_image', value: '' },
    ],
    users: [
      {
        id: 'cms0du1m40000v32slild2p1s',
        name: 'Super Admin',
        email: 'admin@choutuppal.in',
        username: 'admin',
        phone: '9494348175',
        passwordHash: '$2b$10$eKgBR72xp3KfFQMMGtD/1edRXRft8EmWoxePGQ1ukYtpabWVBneoO',
        role: 'ADMIN',
        planTier: 'PREMIUM',
        villageId: 'v-choutuppal',
        isPublic: true,
        isBanned: false,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'cms0du1m40000v32slild2p1s_alt',
        name: 'Choutuppal Admin',
        email: 'choutuppalapp@gmail.com',
        username: 'choutuppalapp',
        phone: '9494348175',
        passwordHash: '$2b$10$eKgBR72xp3KfFQMMGtD/1edRXRft8EmWoxePGQ1ukYtpabWVBneoO',
        role: 'ADMIN',
        planTier: 'PREMIUM',
        villageId: 'v-choutuppal',
        isPublic: true,
        isBanned: false,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ],
    lastUpdated: new Date().toISOString(),
  }

  saveStoreToDisk()
  return memoryStore
}

function saveStoreToDisk(): void {
  if (!memoryStore) return
  memoryStore.lastUpdated = new Date().toISOString()
  try {
    const filePath = getStorageFilePath()
    fs.writeFileSync(filePath, JSON.stringify(memoryStore, null, 2), 'utf8')
    // Dual save to fallback location if available
    try {
      const fallbackDir = path.dirname(FALLBACK_STORE_FILE_PATH)
      if (!fs.existsSync(fallbackDir)) fs.mkdirSync(fallbackDir, { recursive: true })
      fs.writeFileSync(FALLBACK_STORE_FILE_PATH, JSON.stringify(memoryStore, null, 2), 'utf8')
    } catch {}
  } catch (err) {
    console.warn('[OfflineStore] Failed to write disk store:', err)
  }
}

// ============================================================================
// LISTINGS CRUD
// ============================================================================

export function getOfflineListings(): OfflineListing[] {
  const store = loadStoreFromDisk()
  return store.listings
}

export function getOfflineListingById(id: string): OfflineListing | null {
  const store = loadStoreFromDisk()
  const clean = (id || '').toLowerCase().trim()
  return store.listings.find((l) => l.id.toLowerCase() === clean || l.slug.toLowerCase() === clean) || null
}

export function getOfflineListingBySlug(slug: string): OfflineListing | null {
  const store = loadStoreFromDisk()
  const clean = (slug || '').toLowerCase().trim()
  return store.listings.find((l) => l.slug.toLowerCase() === clean || l.id.toLowerCase() === clean) || null
}

export function saveOfflineListing(listing: Partial<OfflineListing> & { id?: string; title?: string }): OfflineListing {
  const store = loadStoreFromDisk()
  const now = new Date().toISOString()
  const id = listing.id || `listing_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
  const slug =
    listing.slug ||
    (listing.title
      ? listing.title
          .toLowerCase()
          .replace(/[^a-z0-9\u0C00-\u0C7F]+/g, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 45) +
        '-' +
        Math.random().toString(36).substring(2, 6)
      : `listing-${Date.now()}`)

  const catObj =
    STANDARD_CATEGORIES.find((c) => c.id === listing.categoryId || c.slug === listing.categoryId) ||
    STANDARD_CATEGORIES.find((c) => c.slug === 'services') ||
    STANDARD_CATEGORIES[0]

  const vilObj =
    STANDARD_VILLAGES.find((v) => v.id === listing.villageId || v.slug === listing.villageId) ||
    STANDARD_VILLAGES[0]

  const existingIdx = store.listings.findIndex((l) => l.id === id || l.slug === slug)

  if (existingIdx >= 0) {
    const existing = store.listings[existingIdx]
    const updated: OfflineListing = {
      ...existing,
      ...listing,
      id: existing.id,
      slug: listing.slug || existing.slug,
      title: listing.title || existing.title,
      description: listing.description !== undefined ? listing.description : existing.description,
      type: listing.type || existing.type || 'BUSINESS',
      phone: listing.phone || existing.phone,
      whatsapp: listing.whatsapp || existing.whatsapp || listing.phone || existing.phone,
      address: listing.address || existing.address,
      status: listing.status || existing.status || 'APPROVED',
      isPremium: listing.isPremium !== undefined ? Boolean(listing.isPremium) : existing.isPremium,
      isFeatured: listing.isFeatured !== undefined ? Boolean(listing.isFeatured) : existing.isFeatured,
      coverImage: listing.coverImage || existing.coverImage,
      categoryId: catObj.id,
      villageId: vilObj.id,
      category: { id: catObj.id, name: catObj.name, slug: catObj.slug, icon: catObj.icon, telugu: catObj.telugu },
      village: { id: vilObj.id, name: vilObj.name, slug: vilObj.slug },
      updatedAt: now,
    }
    store.listings[existingIdx] = updated
    saveStoreToDisk()
    return updated
  }

  const newListing: OfflineListing = {
    id,
    slug,
    title: listing.title || 'New Business Listing',
    description: listing.description || `${listing.title || 'Business'} in Choutuppal`,
    type: listing.type || 'BUSINESS',
    status: listing.status || 'APPROVED',
    isFeatured: Boolean(listing.isFeatured),
    isPremium: Boolean(listing.isPremium),
    coverImage: listing.coverImage || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    logo: listing.logo || null,
    phone: listing.phone || '9494348175',
    whatsapp: listing.whatsapp || listing.phone || '9494348175',
    address: listing.address || 'Choutuppal, Telangana 508252',
    avgRating: listing.avgRating ?? 4.9,
    views: listing.views ?? Math.floor(Math.random() * 50) + 10,
    clicks: listing.clicks ?? 0,
    whatsappClicks: listing.whatsappClicks ?? 0,
    categoryId: catObj.id,
    villageId: vilObj.id,
    category: { id: catObj.id, name: catObj.name, slug: catObj.slug, icon: catObj.icon, telugu: catObj.telugu },
    village: { id: vilObj.id, name: vilObj.name, slug: vilObj.slug },
    owner: listing.owner || { id: 'cms0du1m40000v32slild2p1s', name: 'Admin', username: 'admin', phone: '9494348175' },
    createdAt: now,
    updatedAt: now,
  }

  store.listings.unshift(newListing)
  saveStoreToDisk()
  return newListing
}

export function deleteOfflineListing(id: string): boolean {
  const store = loadStoreFromDisk()
  const initialLen = store.listings.length
  store.listings = store.listings.filter((l) => l.id !== id && l.slug !== id)
  if (store.listings.length !== initialLen) {
    saveStoreToDisk()
    return true
  }
  return false
}

// ============================================================================
// TAXONOMY
// ============================================================================

export function getOfflineCategories(): ServiceCategory[] {
  return STANDARD_CATEGORIES
}

export function getOfflineVillages(): any[] {
  return STANDARD_VILLAGES
}

// ============================================================================
// REAL ESTATE CRUD
// ============================================================================

export function getOfflineRealEstates(): OfflineRealEstate[] {
  const store = loadStoreFromDisk()
  return store.realEstates
}

export function saveOfflineRealEstate(item: any): OfflineRealEstate {
  const store = loadStoreFromDisk()
  const id = item.id || `re_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
  const vilObj = STANDARD_VILLAGES.find((v) => v.id === item.villageId || v.slug === item.villageId) || STANDARD_VILLAGES[0]

  const existingIdx = store.realEstates.findIndex((r) => r.id === id)
  if (existingIdx >= 0) {
    const updated = {
      ...store.realEstates[existingIdx],
      ...item,
      id,
      village: { id: vilObj.id, name: vilObj.name, slug: vilObj.slug },
      updatedAt: new Date().toISOString(),
    }
    store.realEstates[existingIdx] = updated
    saveStoreToDisk()
    return updated
  }

  const newItem: OfflineRealEstate = {
    id,
    title: item.title || 'Real Estate Property',
    slug: item.slug || `property-${Date.now()}`,
    description: item.description || '',
    coverImage: item.coverImage || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
    price: Number(item.price) || 1000000,
    negotiable: Boolean(item.negotiable),
    type: item.type || 'PLOT',
    listingType: item.listingType || 'SALE',
    bedrooms: item.bedrooms ?? null,
    bathrooms: item.bathrooms ?? null,
    areaSqft: item.areaSqft || 1800,
    address: item.address || `${vilObj.name}, Choutuppal`,
    villageId: vilObj.id,
    village: { id: vilObj.id, name: vilObj.name, slug: vilObj.slug },
    status: item.status || 'APPROVED',
    contactPhone: item.contactPhone || '9494348175',
    contactWhatsapp: item.contactWhatsapp || item.contactPhone || '9494348175',
    views: item.views || 100,
    createdAt: new Date().toISOString(),
  }
  store.realEstates.unshift(newItem)
  saveStoreToDisk()
  return newItem
}

export function deleteOfflineRealEstate(id: string): boolean {
  const store = loadStoreFromDisk()
  const initial = store.realEstates.length
  store.realEstates = store.realEstates.filter((r) => r.id !== id && r.slug !== id)
  if (store.realEstates.length !== initial) {
    saveStoreToDisk()
    return true
  }
  return false
}

// ============================================================================
// BANNERS CRUD
// ============================================================================

export function getOfflineBanners(): any[] {
  const store = loadStoreFromDisk()
  return store.banners
}

export function saveOfflineBanner(banner: any): any {
  const store = loadStoreFromDisk()
  const id = banner.id || `banner_${Date.now()}`
  const existingIdx = store.banners.findIndex((b) => b.id === id)
  if (existingIdx >= 0) {
    const updated = { ...store.banners[existingIdx], ...banner, id }
    store.banners[existingIdx] = updated
    saveStoreToDisk()
    return updated
  }
  const newBanner = {
    id,
    title: banner.title || 'Special Banner Ad',
    imageUrl: banner.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    link: banner.link || '/explore',
    position: banner.position || 'HOME_TOP',
    status: banner.status || 'APPROVED',
    isActive: banner.isActive ?? true,
    createdAt: new Date().toISOString(),
  }
  store.banners.unshift(newBanner)
  saveStoreToDisk()
  return newBanner
}

export function deleteOfflineBanner(id: string): boolean {
  const store = loadStoreFromDisk()
  const initial = store.banners.length
  store.banners = store.banners.filter((b) => b.id !== id)
  if (store.banners.length !== initial) {
    saveStoreToDisk()
    return true
  }
  return false
}

// ============================================================================
// STORIES CRUD
// ============================================================================

export function getOfflineStories(): any[] {
  const store = loadStoreFromDisk()
  return store.stories
}

export function saveOfflineStory(story: any): any {
  const store = loadStoreFromDisk()
  const id = story.id || `story_${Date.now()}`
  const existingIdx = store.stories.findIndex((s) => s.id === id)
  if (existingIdx >= 0) {
    const updated = { ...store.stories[existingIdx], ...story, id }
    store.stories[existingIdx] = updated
    saveStoreToDisk()
    return updated
  }
  const newStory = {
    id,
    mediaUrl: story.mediaUrl || '',
    mediaType: story.mediaType || 'IMAGE',
    caption: story.caption || 'Choutuppal Story',
    link: story.link || '/',
    isActive: story.isActive ?? true,
    createdAt: new Date().toISOString(),
  }
  store.stories.unshift(newStory)
  saveStoreToDisk()
  return newStory
}

export function deleteOfflineStory(id: string): boolean {
  const store = loadStoreFromDisk()
  const initial = store.stories.length
  store.stories = store.stories.filter((s) => s.id !== id)
  if (store.stories.length !== initial) {
    saveStoreToDisk()
    return true
  }
  return false
}

// ============================================================================
// SHORTS CRUD
// ============================================================================

export function getOfflineShorts(): any[] {
  const store = loadStoreFromDisk()
  return store.shorts
}

export function saveOfflineShort(short: any): any {
  const store = loadStoreFromDisk()
  const id = short.id || `short_${Date.now()}`
  const existingIdx = store.shorts.findIndex((s) => s.id === id)
  if (existingIdx >= 0) {
    const updated = { ...store.shorts[existingIdx], ...short, id }
    store.shorts[existingIdx] = updated
    saveStoreToDisk()
    return updated
  }
  const newShort = {
    id,
    videoUrl: short.videoUrl || '',
    youtubeId: short.youtubeId || '',
    title: short.title || 'Choutuppal Short Video',
    thumbnail: short.thumbnail || '',
    views: short.views || 0,
    likes: short.likes || 0,
    createdAt: new Date().toISOString(),
  }
  store.shorts.unshift(newShort)
  saveStoreToDisk()
  return newShort
}

export function deleteOfflineShort(id: string): boolean {
  const store = loadStoreFromDisk()
  const initial = store.shorts.length
  store.shorts = store.shorts.filter((s) => s.id !== id)
  if (store.shorts.length !== initial) {
    saveStoreToDisk()
    return true
  }
  return false
}

// ============================================================================
// NEWS & BLOGS CRUD
// ============================================================================

export function getOfflineNews(): any[] {
  const store = loadStoreFromDisk()
  return store.news
}

export function getOfflineNewsBySlug(slug: string): any | null {
  const store = loadStoreFromDisk()
  const clean = (slug || '').toLowerCase().trim()
  return store.news.find((n) => n.slug.toLowerCase() === clean || n.id.toLowerCase() === clean) || null
}

export function saveOfflineNews(newsItem: any): any {
  const store = loadStoreFromDisk()
  const now = new Date().toISOString()
  const id = newsItem.id || `news-${Date.now()}`
  const slug =
    newsItem.slug ||
    (newsItem.title
      ? newsItem.title
          .toLowerCase()
          .replace(/[^a-z0-9\u0C00-\u0C7F]+/g, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 45) +
        '-' +
        Math.random().toString(36).substring(2, 5)
      : `news-${Date.now()}`)

  const existingIdx = store.news.findIndex((n) => n.id === id || n.slug === slug)
  if (existingIdx >= 0) {
    const updated = {
      ...store.news[existingIdx],
      ...newsItem,
      id: store.news[existingIdx].id,
      updatedAt: now,
    }
    store.news[existingIdx] = updated
    saveStoreToDisk()
    return updated
  }

  const newItem = {
    id,
    slug,
    title: newsItem.title || 'News Update',
    summary: newsItem.summary || (newsItem.content ? newsItem.content.slice(0, 120) : ''),
    content: newsItem.content || '',
    image: newsItem.image || null,
    tags: newsItem.tags || ['Choutuppal', 'News'],
    isPublished: newsItem.isPublished ?? true,
    views: newsItem.views || 0,
    createdAt: now,
    updatedAt: now,
    author: newsItem.author || { name: 'చౌటుప్పల్ న్యూస్ డెస్క్' },
  }
  store.news.unshift(newItem)
  saveStoreToDisk()
  return newItem
}

export function deleteOfflineNews(id: string): boolean {
  const store = loadStoreFromDisk()
  const initial = store.news.length
  store.news = store.news.filter((n) => n.id !== id && n.slug !== id)
  if (store.news.length !== initial) {
    saveStoreToDisk()
    return true
  }
  return false
}

export function getOfflineBlogs(): any[] {
  const store = loadStoreFromDisk()
  return store.blogs
}

export function getOfflineBlogBySlug(slug: string): any | null {
  const store = loadStoreFromDisk()
  const clean = (slug || '').toLowerCase().trim()
  return store.blogs.find((b) => b.slug.toLowerCase() === clean || b.id.toLowerCase() === clean) || null
}

export function saveOfflineBlog(blogItem: any): any {
  const store = loadStoreFromDisk()
  const now = new Date().toISOString()
  const id = blogItem.id || `blog-${Date.now()}`
  const slug =
    blogItem.slug ||
    (blogItem.title
      ? blogItem.title
          .toLowerCase()
          .replace(/[^a-z0-9\u0C00-\u0C7F]+/g, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 45) +
        '-' +
        Math.random().toString(36).substring(2, 5)
      : `blog-${Date.now()}`)

  const existingIdx = store.blogs.findIndex((b) => b.id === id || b.slug === slug)
  if (existingIdx >= 0) {
    const updated = {
      ...store.blogs[existingIdx],
      ...blogItem,
      id: store.blogs[existingIdx].id,
      updatedAt: now,
    }
    store.blogs[existingIdx] = updated
    saveStoreToDisk()
    return updated
  }

  const newItem = {
    id,
    slug,
    title: blogItem.title || 'Blog Post',
    excerpt: blogItem.excerpt || (blogItem.content ? blogItem.content.slice(0, 120) : ''),
    content: blogItem.content || '',
    coverImage: blogItem.coverImage || blogItem.image || null,
    category: blogItem.category || 'General',
    tags: blogItem.tags || ['Choutuppal', 'Guide'],
    isPublished: blogItem.isPublished ?? true,
    views: blogItem.views || 0,
    createdAt: now,
    updatedAt: now,
    author: blogItem.author || { name: 'చౌటుప్పల్ బ్లాగ్ డెస్క్' },
  }
  store.blogs.unshift(newItem)
  saveStoreToDisk()
  return newItem
}

export function deleteOfflineBlog(id: string): boolean {
  const store = loadStoreFromDisk()
  const initial = store.blogs.length
  store.blogs = store.blogs.filter((b) => b.id !== id && b.slug !== id)
  if (store.blogs.length !== initial) {
    saveStoreToDisk()
    return true
  }
  return false
}

// ============================================================================
// SETTINGS CRUD
// ============================================================================

export function getOfflineSettings(): any[] {
  const store = loadStoreFromDisk()
  return store.settings
}

export function saveOfflineSetting(key: string, value: string): any {
  const store = loadStoreFromDisk()
  const existingIdx = store.settings.findIndex((s) => s.key === key)
  if (existingIdx >= 0) {
    store.settings[existingIdx].value = value
  } else {
    store.settings.push({ key, value })
  }
  saveStoreToDisk()
  return { key, value }
}

// ============================================================================
// USERS CRUD
// ============================================================================

export function getOfflineUsers(): any[] {
  const store = loadStoreFromDisk()
  return store.users
}

export function saveOfflineUser(user: any): any {
  const store = loadStoreFromDisk()
  const existingIdx = store.users.findIndex(
    (u) =>
      (user.id && u.id === user.id) ||
      (user.email && u.email?.toLowerCase() === user.email.toLowerCase()) ||
      (user.phone && u.phone === user.phone) ||
      (user.username && u.username?.toLowerCase() === user.username.toLowerCase())
  )

  const now = new Date().toISOString()
  if (existingIdx >= 0) {
    const updated = {
      ...store.users[existingIdx],
      ...user,
      updatedAt: now,
    }
    store.users[existingIdx] = updated
    saveStoreToDisk()
    return updated
  }

  const newUser = {
    id: user.id || `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: user.name || 'Citizen',
    email: user.email || null,
    username: user.username || `user_${Math.random().toString(36).substring(2, 7)}`,
    phone: user.phone || null,
    passwordHash: user.passwordHash || null,
    role: user.role || 'USER',
    planTier: user.planTier || 'FREE',
    planExpiresAt: user.planExpiresAt || null,
    villageId: user.villageId || 'v-choutuppal',
    bio: user.bio || null,
    image: user.image || null,
    coverImage: user.coverImage || null,
    isPublic: user.isPublic ?? true,
    isBanned: user.isBanned ?? false,
    createdAt: now,
    updatedAt: now,
  }

  store.users.push(newUser)
  saveStoreToDisk()
  return newUser
}

export function deleteOfflineUser(id: string): boolean {
  const store = loadStoreFromDisk()
  const initial = store.users.length
  store.users = store.users.filter((u) => u.id !== id && u.email !== id && u.username !== id)
  if (store.users.length !== initial) {
    saveStoreToDisk()
    return true
  }
  return false
}
