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

export const INITIAL_OFFLINE_LISTINGS: OfflineListing[] = [
  {
    id: 'list-1',
    slug: 'sri-sai-ram-electricals-plumber-works',
    title: 'Sri Sai Ram Electricals & Plumber Works',
    description: 'Expert 24/7 home electricians, plumbing repairs, sanitary fittings, submersible motor wiring & inverter installations.',
    status: 'APPROVED',
    isFeatured: true,
    isPremium: true,
    coverImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    phone: '9494348175',
    whatsapp: '9494348175',
    address: 'Main Road, Near Bus Stand, Choutuppal',
    avgRating: 4.8,
    views: 1890,
    clicks: 280,
    whatsappClicks: 155,
    categoryId: 'cat-services',
    villageId: 'v-choutuppal',
    category: { id: 'cat-services', name: 'Services & Technicians', slug: 'services', icon: 'Wrench', telugu: 'సేవలు & టెక్నీషియన్లు' },
    village: { id: 'v-choutuppal', name: 'Choutuppal Town', slug: 'choutuppal' },
    owner: { id: 'cms0du1m40000v32slild2p1s', name: 'Choutuppal Admin', username: 'admin', phone: '9494348175' },
    createdAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'list-2',
    slug: 'bhavani-electrical-works-rewinding',
    title: 'Bhavani Electrical Works & Rewinding',
    description: 'Motor rewinding, submersible pump repair, home wiring, fan rewinding & industrial electrical repairs.',
    status: 'APPROVED',
    isFeatured: true,
    isPremium: false,
    coverImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    phone: '9848012345',
    whatsapp: '9848012345',
    address: 'Shiva Temple Street, Choutuppal',
    avgRating: 4.8,
    views: 1420,
    clicks: 190,
    whatsappClicks: 95,
    categoryId: 'cat-electrical',
    villageId: 'v-choutuppal',
    category: { id: 'cat-electrical', name: 'Electrical & Hardware', slug: 'electrical-hardware', icon: 'Zap', telugu: 'ఎలక్ట్రికల్ & హార్డ్‌వేర్' },
    village: { id: 'v-choutuppal', name: 'Choutuppal Town', slug: 'choutuppal' },
    owner: { id: 'cms0du1m40000v32slild2p1s', name: 'Choutuppal Admin', username: 'admin', phone: '9494348175' },
    createdAt: '2026-01-11T10:00:00Z',
  },
  {
    id: 'list-3',
    slug: 'venkateshwara-medical-general-stores',
    title: 'Venkateshwara Medical & General Stores',
    description: '24x7 allopathic medicines, emergency surgical items, baby care, BP/Sugar testing & free door delivery in Choutuppal.',
    status: 'APPROVED',
    isFeatured: true,
    isPremium: true,
    coverImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
    phone: '9849123456',
    whatsapp: '9849123456',
    address: 'Opp. Community Hospital, Choutuppal',
    avgRating: 4.9,
    views: 2100,
    clicks: 410,
    whatsappClicks: 210,
    categoryId: 'cat-health',
    villageId: 'v-choutuppal',
    category: { id: 'cat-health', name: 'Health & Medical', slug: 'health-medical', icon: 'HeartPulse', telugu: 'వైద్యం & ఫార్మసీ' },
    village: { id: 'v-choutuppal', name: 'Choutuppal Town', slug: 'choutuppal' },
    owner: { id: 'cms0du1m40000v32slild2p1s', name: 'Choutuppal Admin', username: 'admin', phone: '9494348175' },
    createdAt: '2026-01-12T10:00:00Z',
  },
  {
    id: 'list-4',
    slug: 'sri-lakshmi-kirana-general-stores',
    title: 'Sri Lakshmi Kirana & General Stores',
    description: 'Daily essentials, fresh groceries, premium pulses, edible oils, spices & household provisions.',
    status: 'APPROVED',
    isFeatured: true,
    isPremium: false,
    coverImage: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',
    phone: '9988776655',
    whatsapp: '9988776655',
    address: 'Gandhi Chowk, Choutuppal',
    avgRating: 4.7,
    views: 1650,
    clicks: 190,
    whatsappClicks: 95,
    categoryId: 'cat-retail',
    villageId: 'v-choutuppal',
    category: { id: 'cat-retail', name: 'Retail Shopping', slug: 'retail-shopping', icon: 'ShoppingBag', telugu: 'షాపింగ్ & దుస్తులు' },
    village: { id: 'v-choutuppal', name: 'Choutuppal Town', slug: 'choutuppal' },
    owner: { id: 'cms0du1m40000v32slild2p1s', name: 'Choutuppal Admin', username: 'admin', phone: '9494348175' },
    createdAt: '2026-01-13T10:00:00Z',
  },
  {
    id: 'list-5',
    slug: 'gayatri-plumbing-sanitary-hardware',
    title: 'Gayatri Plumbing & Sanitary Hardware',
    description: 'CPVC/PVC pipe fittings, sanitary ware, water tanks, taps, bathroom accessories & professional plumbing services.',
    status: 'APPROVED',
    isFeatured: true,
    isPremium: false,
    coverImage: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
    phone: '9876543210',
    whatsapp: '9876543210',
    address: 'NH 65 Bypass, Choutuppal',
    avgRating: 4.8,
    views: 1350,
    clicks: 210,
    whatsappClicks: 105,
    categoryId: 'cat-services',
    villageId: 'v-choutuppal',
    category: { id: 'cat-services', name: 'Services & Technicians', slug: 'services', icon: 'Wrench', telugu: 'సేవలు & టెక్నీషియన్లు' },
    village: { id: 'v-choutuppal', name: 'Choutuppal Town', slug: 'choutuppal' },
    owner: { id: 'cms0du1m40000v32slild2p1s', name: 'Choutuppal Admin', username: 'admin', phone: '9494348175' },
    createdAt: '2026-01-14T10:00:00Z',
  },
  {
    id: 'list-6',
    slug: 'choutuppal-real-estate-land-developers',
    title: 'Choutuppal Real Estate & Land Developers',
    description: 'HMDA & DTCP approved open residential plots, farmland ventures, highway facing commercial bit lands & house sales.',
    status: 'APPROVED',
    isFeatured: true,
    isPremium: true,
    coverImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
    phone: '9440123456',
    whatsapp: '9440123456',
    address: 'Hyderabad Highway, Choutuppal',
    avgRating: 4.9,
    views: 2950,
    clicks: 580,
    whatsappClicks: 320,
    categoryId: 'cat-realestate',
    villageId: 'v-malkapur',
    category: { id: 'cat-realestate', name: 'Real Estate & Lands', slug: 'real-estate', icon: 'Home', telugu: 'రియల్ ఎస్టేట్ & ప్లాట్లు' },
    village: { id: 'v-malkapur', name: 'Malkapur', slug: 'malkapur' },
    owner: { id: 'cms0du1m40000v32slild2p1s', name: 'Choutuppal Admin', username: 'admin', phone: '9494348175' },
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'list-7',
    slug: 'sri-lakshmi-tiffin-center',
    title: 'Sri Lakshmi Tiffin Center',
    description: 'Famous for hot idli, dosa, upma, poori & filter coffee. Fresh morning tiffins and evening snacks served daily since 2008.',
    status: 'APPROVED',
    isFeatured: true,
    isPremium: true,
    coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    phone: '9494348175',
    whatsapp: '9494348175',
    address: 'Main Road, Near Bus Stand, Choutuppal',
    avgRating: 4.9,
    views: 2450,
    clicks: 340,
    whatsappClicks: 180,
    categoryId: 'cat-food',
    villageId: 'v-choutuppal',
    category: { id: 'cat-food', name: 'Food & Dining', slug: 'food-dining', icon: 'UtensilsCrossed', telugu: 'హోటల్స్ & రెస్టారెంట్లు' },
    village: { id: 'v-choutuppal', name: 'Choutuppal Town', slug: 'choutuppal' },
    owner: { id: 'cms0du1m40000v32slild2p1s', name: 'Choutuppal Admin', username: 'admin', phone: '9494348175' },
    createdAt: '2026-01-16T10:00:00Z',
  },
  {
    id: 'list-8',
    slug: 'reddy-automobiles-bike-point',
    title: 'Reddy Automobiles & 2-Wheeler Service',
    description: 'Complete multi-brand bike servicing, engine oil change, water wash, puncture repair and original genuine spare parts.',
    status: 'APPROVED',
    isFeatured: true,
    isPremium: true,
    coverImage: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80',
    phone: '9912353710',
    whatsapp: '9912353710',
    address: 'Hyderabad Highway (NH 65), Panthangi',
    avgRating: 4.8,
    views: 1420,
    clicks: 220,
    whatsappClicks: 110,
    categoryId: 'cat-automobile',
    villageId: 'v-panthangi',
    category: { id: 'cat-automobile', name: 'Automobile & Garage', slug: 'automobile', icon: 'Car', telugu: 'ఆటోమొబైల్ & గ్యారేజ్' },
    village: { id: 'v-panthangi', name: 'Panthangi', slug: 'panthangi' },
    owner: { id: 'cms0du1m40000v32slild2p1s', name: 'Choutuppal Admin', username: 'admin', phone: '9494348175' },
    createdAt: '2026-01-17T10:00:00Z',
  },
  {
    id: 'list-9',
    slug: 'sri-venkateswara-mobiles-services',
    title: 'Sri Venkateswara Mobiles & Electronics',
    description: 'All brands latest mobile phones, display replacement, glass change, accessories, recharges & zero down-payment EMI.',
    status: 'APPROVED',
    isFeatured: false,
    isPremium: false,
    coverImage: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
    phone: '9912353707',
    whatsapp: '9912353707',
    address: 'Clock Tower Center, Choutuppal',
    avgRating: 4.7,
    views: 1220,
    clicks: 175,
    whatsappClicks: 80,
    categoryId: 'cat-electronics',
    villageId: 'v-choutuppal',
    category: { id: 'cat-electronics', name: 'Electronics & Mobiles', slug: 'electronics', icon: 'Smartphone', telugu: 'మొబైల్స్ & ఎలక్ట్రానిక్స్' },
    village: { id: 'v-choutuppal', name: 'Choutuppal Town', slug: 'choutuppal' },
    owner: { id: 'cms0du1m40000v32slild2p1s', name: 'Choutuppal Admin', username: 'admin', phone: '9494348175' },
    createdAt: '2026-01-18T10:00:00Z',
  },
  {
    id: 'list-10',
    slug: 'choutuppal-meeseva-internet-center',
    title: 'Choutuppal Digital MeeSeva & Net Center',
    description: 'Online certificates, Aadhar card updates, voter ID, PAN card, passport application, Xerox, color printouts & lamination.',
    status: 'APPROVED',
    isFeatured: true,
    isPremium: false,
    coverImage: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80',
    phone: '9494348175',
    whatsapp: '9494348175',
    address: 'Near MRO Office, Choutuppal',
    avgRating: 4.8,
    views: 1380,
    clicks: 210,
    whatsappClicks: 95,
    categoryId: 'cat-internet',
    villageId: 'v-choutuppal',
    category: { id: 'cat-internet', name: 'Internet & MeeSeva', slug: 'internet-cyber-cafe', icon: 'Globe', telugu: 'మీసేవ & నెట్ సెంటర్' },
    village: { id: 'v-choutuppal', name: 'Choutuppal Town', slug: 'choutuppal' },
    owner: { id: 'cms0du1m40000v32slild2p1s', name: 'Choutuppal Admin', username: 'admin', phone: '9494348175' },
    createdAt: '2026-01-19T10:00:00Z',
  },
  {
    id: 'list-11',
    slug: 'sri-sai-vidya-niketan-school',
    title: 'Sri Sai Vidya Niketan High School',
    description: 'CBSE syllabus education from Nursery to 10th class. Digital smart classes, sports ground & school bus for all villages.',
    status: 'APPROVED',
    isFeatured: false,
    isPremium: false,
    coverImage: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    phone: '9912353709',
    whatsapp: '9912353709',
    address: 'Yadadri Road, Panthangi, Choutuppal',
    avgRating: 4.9,
    views: 1100,
    clicks: 140,
    whatsappClicks: 65,
    categoryId: 'cat-education',
    villageId: 'v-panthangi',
    category: { id: 'cat-education', name: 'Education & Coaching', slug: 'education', icon: 'GraduationCap', telugu: 'విద్య & కోచింగ్' },
    village: { id: 'v-panthangi', name: 'Panthangi', slug: 'panthangi' },
    owner: { id: 'cms0du1m40000v32slild2p1s', name: 'Choutuppal Admin', username: 'admin', phone: '9494348175' },
    createdAt: '2026-01-18T10:00:00Z',
  },
  {
    id: 'list-12',
    slug: 'lakshmi-ganapathi-textiles-sarees',
    title: 'Lakshmi Ganapathi Textiles & Sarees',
    description: 'Pattu sarees, fancy dresses, mens shirts, readymade suits, wedding collections & matching center at wholesale rates.',
    status: 'APPROVED',
    isFeatured: false,
    isPremium: false,
    coverImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    phone: '9912353711',
    whatsapp: '9912353711',
    address: 'Cloth Market Lane, Choutuppal',
    avgRating: 4.7,
    views: 950,
    clicks: 115,
    whatsappClicks: 50,
    categoryId: 'cat-retail',
    villageId: 'v-choutuppal',
    category: { id: 'cat-retail', name: 'Retail Shopping', slug: 'retail-shopping', icon: 'ShoppingBag', telugu: 'షాపింగ్ & దుస్తులు' },
    village: { id: 'v-choutuppal', name: 'Choutuppal Town', slug: 'choutuppal' },
    owner: { id: 'cms0du1m40000v32slild2p1s', name: 'Choutuppal Admin', username: 'admin', phone: '9494348175' },
    createdAt: '2026-01-19T10:00:00Z',
  },
  {
    id: 'list-13',
    slug: 'kisan-agri-seeds-fertilizers',
    title: 'Kisan Agri Seeds, Fertilizers & Pesticides',
    description: 'High yield hybrid seeds, organic fertilizers, pesticides, drip irrigation tubes, sprayer pumps & expert agri counseling.',
    status: 'APPROVED',
    isFeatured: true,
    isPremium: false,
    coverImage: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80',
    phone: '9876543210',
    whatsapp: '9876543210',
    address: 'Agricultural Market Yard Road, Peddakondur',
    avgRating: 4.8,
    views: 1340,
    clicks: 160,
    whatsappClicks: 85,
    categoryId: 'cat-agriculture',
    villageId: 'v-peddakondur',
    category: { id: 'cat-agriculture', name: 'Agriculture & Seeds', slug: 'agriculture', icon: 'Sprout', telugu: 'వ్యవసాయం & ఎరువులు' },
    village: { id: 'v-peddakondur', name: 'Peddakondur', slug: 'peddakondur' },
    owner: { id: 'cms0du1m40000v32slild2p1s', name: 'Choutuppal Admin', username: 'admin', phone: '9494348175' },
    createdAt: '2026-01-20T10:00:00Z',
  },
  {
    id: 'list-14',
    slug: 'srinivasa-building-materials-cement',
    title: 'Srinivasa Building Materials & Cement',
    description: 'TMT steel bars, UltraTech / Priya cement, sand, river gravel, red bricks, stone dust & construction logistics supply.',
    status: 'APPROVED',
    isFeatured: false,
    isPremium: true,
    coverImage: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
    phone: '9912353715',
    whatsapp: '9912353715',
    address: 'Bypass Road, Tupranpet Stage, Choutuppal',
    avgRating: 4.8,
    views: 1560,
    clicks: 195,
    whatsappClicks: 90,
    categoryId: 'cat-building',
    villageId: 'v-tupranpet',
    category: { id: 'cat-building', name: 'Building Materials', slug: 'building-materials', icon: 'BrickWall', telugu: 'భవన నిర్మాణ సామాగ్రి' },
    village: { id: 'v-tupranpet', name: 'Tupranpet', slug: 'tupranpet' },
    owner: { id: 'cms0du1m40000v32slild2p1s', name: 'Choutuppal Admin', username: 'admin', phone: '9494348175' },
    createdAt: '2026-01-21T10:00:00Z',
  },
]

let offlineListingsStore: OfflineListing[] = [...INITIAL_OFFLINE_LISTINGS]

export function getOfflineListings(): OfflineListing[] {
  return offlineListingsStore
}

export function getOfflineListingById(id: string): OfflineListing | null {
  return offlineListingsStore.find((l) => l.id === id) || null
}

export function getOfflineListingBySlug(slug: string): OfflineListing | null {
  const clean = slug.toLowerCase().trim()
  return offlineListingsStore.find((l) => l.slug?.toLowerCase() === clean || l.id === clean) || null
}

export function saveOfflineListing(listing: Partial<OfflineListing> & { id?: string; title?: string }): OfflineListing {
  const now = new Date().toISOString()
  const id = listing.id || `listing_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
  const slug = listing.slug || (listing.title ? listing.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : `listing-${Date.now()}`)

  // resolve category & village
  const catObj = STANDARD_CATEGORIES.find((c) => c.id === listing.categoryId || c.slug === listing.categoryId) || STANDARD_CATEGORIES[0]
  const vilObj = STANDARD_VILLAGES.find((v) => v.id === listing.villageId || v.slug === listing.villageId) || STANDARD_VILLAGES[0]

  const existingIdx = offlineListingsStore.findIndex((l) => l.id === id || l.slug === slug)

  if (existingIdx >= 0) {
    const updated: OfflineListing = {
      ...offlineListingsStore[existingIdx],
      ...listing,
      id: offlineListingsStore[existingIdx].id,
      category: catObj ? { id: catObj.id, name: catObj.name, slug: catObj.slug, icon: catObj.icon, telugu: catObj.telugu } : offlineListingsStore[existingIdx].category,
      village: vilObj ? { id: vilObj.id, name: vilObj.name, slug: vilObj.slug } : offlineListingsStore[existingIdx].village,
      updatedAt: now,
    }
    offlineListingsStore[existingIdx] = updated
    return updated
  }

  const newListing: OfflineListing = {
    id,
    slug,
    title: listing.title || 'New Shop Listing',
    description: listing.description || 'Welcome to our business in Choutuppal.',
    status: listing.status || 'APPROVED',
    isFeatured: listing.isFeatured ?? false,
    isPremium: listing.isPremium ?? false,
    coverImage: listing.coverImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    phone: listing.phone || '9494348175',
    whatsapp: listing.whatsapp || listing.phone || '9494348175',
    address: listing.address || 'Choutuppal, Telangana',
    avgRating: listing.avgRating ?? 5.0,
    views: listing.views ?? 1,
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

  offlineListingsStore.unshift(newListing)
  return newListing
}

export function deleteOfflineListing(id: string): boolean {
  const initialLen = offlineListingsStore.length
  offlineListingsStore = offlineListingsStore.filter((l) => l.id !== id && l.slug !== id)
  return offlineListingsStore.length < initialLen
}

export function getOfflineCategories(): ServiceCategory[] {
  return STANDARD_CATEGORIES
}

export function getOfflineVillages(): any[] {
  return STANDARD_VILLAGES
}

export function getOfflineSettings(): any[] {
  return [
    { key: 'spin_enabled', value: 'true' },
    { key: 'pricing_free', value: 'true' },
    { key: 'banner_free', value: 'true' },
    { key: 'ads_paid', value: 'false' },
    { key: 'banner_price', value: '99' },
    { key: 'announcement_ticker', value: 'చౌటుప్పల్ సూపర్ యాప్‌లోకి స్వాగతం! మీ వ్యాపారాన్ని ఉచితంగా రిజిస్టర్ చేసుకోండి.' },
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
    id: 'news-5',
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

let offlineNewsStore = [...OFFLINE_NEWS_ARTICLES]

export function getOfflineNews(): any[] {
  return offlineNewsStore
}

export function getOfflineNewsBySlug(slug: string): any | null {
  const cleanSlug = slug.toLowerCase().trim()
  return (
    offlineNewsStore.find(
      (n) => n.slug.toLowerCase() === cleanSlug || n.id.toLowerCase() === cleanSlug
    ) ||
    offlineBlogsStore.find(
      (b) => b.slug.toLowerCase() === cleanSlug || b.id.toLowerCase() === cleanSlug
    ) ||
    null
  )
}

export function saveOfflineNews(newsItem: any): any {
  const now = new Date()
  const id = newsItem.id || `news-${Date.now()}`
  const slug = newsItem.slug || (newsItem.title ? newsItem.title.toLowerCase().replace(/[^a-z0-9\u0C00-\u0C7F]+/g, '-').replace(/^-|-$/g, '').slice(0, 45) + '-' + Math.random().toString(36).substring(2, 5) : `news-${Date.now()}`)

  const existingIdx = offlineNewsStore.findIndex((n) => n.id === id || n.slug === slug)
  if (existingIdx >= 0) {
    const updated = {
      ...offlineNewsStore[existingIdx],
      ...newsItem,
      id: offlineNewsStore[existingIdx].id,
      updatedAt: now,
    }
    offlineNewsStore[existingIdx] = updated
    return updated
  }

  const newItem = {
    id,
    slug,
    title: newsItem.title || 'News Update',
    summary: newsItem.summary || (newsItem.content ? newsItem.content.slice(0, 120) : ''),
    content: newsItem.content || '',
    image: newsItem.image || 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&w=800&q=80',
    tags: newsItem.tags || ['Choutuppal', 'News'],
    isPublished: newsItem.isPublished ?? true,
    views: newsItem.views || 10,
    createdAt: now,
    updatedAt: now,
    author: newsItem.author || { name: 'చౌటుప్పల్ న్యూస్ డెస్క్' },
  }
  offlineNewsStore.unshift(newItem)
  return newItem
}

export function deleteOfflineNews(id: string): boolean {
  const initial = offlineNewsStore.length
  offlineNewsStore = offlineNewsStore.filter((n) => n.id !== id && n.slug !== id)
  return offlineNewsStore.length < initial
}

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

let offlineBlogsStore = [...OFFLINE_BLOG_POSTS]

export function getOfflineBlogs(): any[] {
  return offlineBlogsStore
}

export function getOfflineBlogBySlug(slug: string): any | null {
  const cleanSlug = slug.toLowerCase().trim()
  return (
    offlineBlogsStore.find(
      (b) => b.slug.toLowerCase() === cleanSlug || b.id.toLowerCase() === cleanSlug
    ) ||
    offlineNewsStore.find(
      (n) => n.slug.toLowerCase() === cleanSlug || n.id.toLowerCase() === cleanSlug
    ) ||
    null
  )
}

export function saveOfflineBlog(blogItem: any): any {
  const now = new Date()
  const id = blogItem.id || `blog-${Date.now()}`
  const slug = blogItem.slug || (blogItem.title ? blogItem.title.toLowerCase().replace(/[^a-z0-9\u0C00-\u0C7F]+/g, '-').replace(/^-|-$/g, '').slice(0, 45) + '-' + Math.random().toString(36).substring(2, 5) : `blog-${Date.now()}`)

  const existingIdx = offlineBlogsStore.findIndex((b) => b.id === id || b.slug === slug)
  if (existingIdx >= 0) {
    const updated = {
      ...offlineBlogsStore[existingIdx],
      ...blogItem,
      id: offlineBlogsStore[existingIdx].id,
      updatedAt: now,
    }
    offlineBlogsStore[existingIdx] = updated
    return updated
  }

  const newItem = {
    id,
    slug,
    title: blogItem.title || 'Blog Post',
    excerpt: blogItem.excerpt || (blogItem.content ? blogItem.content.slice(0, 120) : ''),
    content: blogItem.content || '',
    coverImage: blogItem.coverImage || blogItem.image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    category: blogItem.category || 'General',
    tags: blogItem.tags || ['Choutuppal', 'Guide'],
    isPublished: blogItem.isPublished ?? true,
    views: blogItem.views || 25,
    createdAt: now,
    updatedAt: now,
    author: blogItem.author || { name: 'చౌటుప్పల్ బ్లాగ్ డెస్క్' },
  }
  offlineBlogsStore.unshift(newItem)
  return newItem
}

export function deleteOfflineBlog(id: string): boolean {
  const initial = offlineBlogsStore.length
  offlineBlogsStore = offlineBlogsStore.filter((b) => b.id !== id && b.slug !== id)
  return offlineBlogsStore.length < initial
}

const INITIAL_BANNERS = [
  {
    id: 'banner-1',
    title: 'Promote Your Business Across Choutuppal',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80',
    link: '/listings',
    position: 'HOME_TOP',
    status: 'APPROVED',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'banner-2',
    title: 'Spin & Win Rewards Everyday on Choutuppal App',
    imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
    link: '/#spin',
    position: 'HOME_MIDDLE',
    status: 'APPROVED',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
]

let offlineBannersStore = [...INITIAL_BANNERS]

export function getOfflineBanners(): any[] {
  return offlineBannersStore
}

export function saveOfflineBanner(banner: any): any {
  const id = banner.id || `banner_${Date.now()}`
  const existingIdx = offlineBannersStore.findIndex((b) => b.id === id)
  if (existingIdx >= 0) {
    const updated = { ...offlineBannersStore[existingIdx], ...banner, id }
    offlineBannersStore[existingIdx] = updated
    return updated
  }
  const newBanner = {
    id,
    title: banner.title || 'Special Banner Ad',
    imageUrl: banner.imageUrl || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80',
    link: banner.link || '/categories',
    position: banner.position || 'HOME_TOP',
    status: banner.status || 'APPROVED',
    isActive: banner.isActive ?? true,
    createdAt: new Date().toISOString(),
  }
  offlineBannersStore.unshift(newBanner)
  return newBanner
}

export function deleteOfflineBanner(id: string): boolean {
  const initial = offlineBannersStore.length
  offlineBannersStore = offlineBannersStore.filter((b) => b.id !== id)
  return offlineBannersStore.length < initial
}

const INITIAL_STORIES = [
  {
    id: 'story-1',
    mediaUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
    mediaType: 'IMAGE',
    caption: 'శ్రీ లక్ష్మి టిఫిన్స్ - స్పెషల్ నెయ్యి కారం దోశ ఆఫర్!',
    link: '/listings/sri-lakshmi-tiffin-center',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'story-2',
    mediaUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80',
    mediaType: 'IMAGE',
    caption: 'మల్కాపూర్ స్టేజ్ వద్ద 200 గజాల HMDA ప్లాట్లు అమ్మకానికి ఉన్నాయి.',
    link: '/real-estate',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
]

let offlineStoriesStore = [...INITIAL_STORIES]

export function getOfflineStories(): any[] {
  return offlineStoriesStore
}

export function saveOfflineStory(story: any): any {
  const id = story.id || `story_${Date.now()}`
  const existingIdx = offlineStoriesStore.findIndex((s) => s.id === id)
  if (existingIdx >= 0) {
    const updated = { ...offlineStoriesStore[existingIdx], ...story, id }
    offlineStoriesStore[existingIdx] = updated
    return updated
  }
  const newStory = {
    id,
    mediaUrl: story.mediaUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
    mediaType: story.mediaType || 'IMAGE',
    caption: story.caption || 'Choutuppal Story',
    link: story.link || '/',
    isActive: story.isActive ?? true,
    createdAt: new Date().toISOString(),
  }
  offlineStoriesStore.unshift(newStory)
  return newStory
}

export function deleteOfflineStory(id: string): boolean {
  const initial = offlineStoriesStore.length
  offlineStoriesStore = offlineStoriesStore.filter((s) => s.id !== id)
  return offlineStoriesStore.length < initial
}

const INITIAL_SHORTS = [
  {
    id: 'short-1',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    youtubeId: 'dQw4w9WgXcQ',
    title: 'చౌటుప్పల్ టౌన్ & మార్కెట్ వాక్‌త్రూ',
    thumbnail: 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=600&auto=format&fit=crop&q=80',
    views: 1840,
    likes: 120,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'short-2',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    youtubeId: 'dQw4w9WgXcQ',
    title: 'యాదాద్రి శ్రీ లక్ష్మీ నరసింహ స్వామి దర్శనం విశేషాలు',
    thumbnail: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&auto=format&fit=crop&q=80',
    views: 2600,
    likes: 310,
    createdAt: new Date().toISOString(),
  },
]

let offlineShortsStore = [...INITIAL_SHORTS]

export function getOfflineShorts(): any[] {
  return offlineShortsStore
}

export function saveOfflineShort(short: any): any {
  const id = short.id || `short_${Date.now()}`
  const existingIdx = offlineShortsStore.findIndex((s) => s.id === id)
  if (existingIdx >= 0) {
    const updated = { ...offlineShortsStore[existingIdx], ...short, id }
    offlineShortsStore[existingIdx] = updated
    return updated
  }
  const newShort = {
    id,
    videoUrl: short.videoUrl || '',
    youtubeId: short.youtubeId || 'dQw4w9WgXcQ',
    title: short.title || 'Choutuppal Short Video',
    thumbnail: short.thumbnail || 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=600&auto=format&fit=crop&q=80',
    views: short.views || 0,
    likes: short.likes || 0,
    createdAt: new Date().toISOString(),
  }
  offlineShortsStore.unshift(newShort)
  return newShort
}

export function deleteOfflineShort(id: string): boolean {
  const initial = offlineShortsStore.length
  offlineShortsStore = offlineShortsStore.filter((s) => s.id !== id)
  return offlineShortsStore.length < initial
}

const INITIAL_REAL_ESTATES = [
  {
    id: 're-1',
    title: 'హైవే ఫేసింగ్ ఓపెన్ ప్లాట్లు (HMDA / DTCP Approved)',
    slug: 'highway-facing-open-plots-choutuppal',
    coverImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
    price: 1500000,
    type: 'PLOT',
    listingType: 'SALE',
    bedrooms: null,
    areaSqft: 1800,
    villageId: 'v-choutuppal',
    status: 'APPROVED',
    contactPhone: '9494348175',
    contactWhatsapp: '9494348175',
    views: 450,
    village: { id: 'v-choutuppal', name: 'Choutuppal Town', slug: 'choutuppal' },
  },
  {
    id: 're-2',
    title: '2BHK ఇండిపెండెంట్ లగ్జరీ హౌస్ అమ్మకానికి',
    slug: '2bhk-independent-luxury-house-lingojiguda',
    coverImage: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
    price: 4200000,
    type: 'HOUSE',
    listingType: 'SALE',
    bedrooms: 2,
    areaSqft: 1350,
    villageId: 'v-lingojiguda',
    status: 'APPROVED',
    contactPhone: '9494348175',
    contactWhatsapp: '9494348175',
    views: 380,
    village: { id: 'v-lingojiguda', name: 'Lingoji Guda', slug: 'lingoji-guda' },
  },
]

let offlineRealEstatesStore = [...INITIAL_REAL_ESTATES]

export function getOfflineRealEstates(): any[] {
  return offlineRealEstatesStore
}

export function saveOfflineRealEstate(item: any): any {
  const id = item.id || `re_${Date.now()}`
  const existingIdx = offlineRealEstatesStore.findIndex((r) => r.id === id)
  if (existingIdx >= 0) {
    const updated = { ...offlineRealEstatesStore[existingIdx], ...item, id }
    offlineRealEstatesStore[existingIdx] = updated
    return updated
  }
  const newItem = {
    id,
    title: item.title || 'Real Estate Property',
    slug: item.slug || `property-${Date.now()}`,
    coverImage: item.coverImage || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
    price: item.price || 1500000,
    type: item.type || 'PLOT',
    listingType: item.listingType || 'SALE',
    bedrooms: item.bedrooms ?? null,
    areaSqft: item.areaSqft || 1800,
    villageId: item.villageId || 'v-choutuppal',
    status: item.status || 'APPROVED',
    contactPhone: item.contactPhone || '9494348175',
    contactWhatsapp: item.contactWhatsapp || '9494348175',
    views: item.views || 10,
    village: STANDARD_VILLAGES.find((v) => v.id === item.villageId) || STANDARD_VILLAGES[0],
    createdAt: new Date().toISOString(),
  }
  offlineRealEstatesStore.unshift(newItem)
  return newItem
}

export function deleteOfflineRealEstate(id: string): boolean {
  const initial = offlineRealEstatesStore.length
  offlineRealEstatesStore = offlineRealEstatesStore.filter((r) => r.id !== id)
  return offlineRealEstatesStore.length < initial
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
    villageId: 'v-choutuppal',
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
    villageId: 'v-choutuppal',
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
    villageId: user.villageId || 'v-choutuppal',
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

export function deleteOfflineUser(id: string): boolean {
  const users = getOfflineUsers()
  const initial = users.length
  offlineUsersStore = users.filter((u) => u.id !== id && u.email !== id && u.username !== id)
  return offlineUsersStore.length < initial
}
