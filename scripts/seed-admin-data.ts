import { prisma } from '../src/lib/prisma'

async function seedAdminData() {
  console.log('--- Starting Admin & Live Data Sync ---')

  // 1. Ensure Categories
  const categoriesData = [
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

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, telugu: cat.telugu, description: cat.description },
      create: cat,
    })
  }

  // 2. Ensure Villages / Wards
  const villagesData = [
    { id: 'cmsepb40r0000jv04tdwwd5cw', name: 'Choutuppal', slug: 'choutuppal' },
    { id: 'v-lingojiguda', name: 'Lingojiguda', slug: 'lingojiguda' },
    { id: 'v-koyyalagudem', name: 'Koyyalagudem', slug: 'koyyalagudem' },
    { id: 'v-dharmojigudem', name: 'Dharmojigudem', slug: 'dharmojigudem' },
    { id: 'v-peepalpahad', name: 'Peepalpahad', slug: 'peepalpahad' },
    { id: 'v-tangadpally', name: 'Tangadpally', slug: 'tangadpally' },
    { id: 'v-panthangi', name: 'Panthangi', slug: 'panthangi' },
    { id: 'v-gundrampally', name: 'Gundrampally', slug: 'gundrampally' },
  ]

  for (const v of villagesData) {
    await prisma.village.upsert({
      where: { slug: v.slug },
      update: { name: v.name },
      create: v,
    })
  }

  // 3. Ensure Admin user exists
  const adminUser = await prisma.user.upsert({
    where: { email: 'choutuppalapp@gmail.com' },
    update: { role: 'ADMIN', planTier: 'PREMIUM' },
    create: {
      id: 'cms0du1m40000v32slild2p1s_alt',
      name: 'Choutuppal Admin',
      email: 'choutuppalapp@gmail.com',
      username: 'choutuppalapp',
      phone: '9494348175',
      passwordHash: '$2b$10$eKgBR72xp3KfFQMMGtD/1edRXRft8EmWoxePGQ1ukYtpabWVBneoO',
      role: 'ADMIN',
      planTier: 'PREMIUM',
      villageId: 'cmsepb40r0000jv04tdwwd5cw',
      bio: 'Official administrator and community lead for Choutuppal App.',
      image: 'https://i.ibb.co/rGwMGrby/logo-pwa-20260922-131108-0000.png',
      isPublic: true,
      isBanned: false,
    },
  })

  // 4. Populate Real Directory Listings
  const listingsToSeed = [
    {
      title: 'Sri Sai Ram Electricals & Plumber Works',
      slug: 'sri-sai-ram-electricals-plumber-works',
      description: 'House wiring, motor rewinding, plumbing repairs, pipe fitting, sanitary works & 24/7 emergency service in Choutuppal.',
      phone: '9494348175',
      whatsapp: '9494348175',
      address: 'Main Road, Near Bus Stand, Choutuppal',
      categoryId: 'cat-electrical',
      villageId: 'cmsepb40r0000jv04tdwwd5cw',
      status: 'APPROVED',
      isPremium: true,
      isFeatured: true,
      coverImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
      views: 1240,
      avgRating: 4.9,
    },
    {
      title: 'చౌటుప్పల్ రాయల్ గ్రాండ్ ఫ్యామిలీ రెస్టారెంట్',
      slug: 'royal-grand-family-restaurant-choutuppal',
      description: 'రుచికరమైన హైదరాబాద్ దమ్ బిర్యానీ, తందూరి రోటీలు, చైనీస్ & సౌత్ ఇండియన్ ఫ్యామిలీ డైనింగ్ హాల్. హోమ్ డెలివరీ కలదు.',
      phone: '9494348175',
      whatsapp: '9494348175',
      address: 'హైదరాబాద్ - విజయవాడ హైవే, చౌటుప్పల్',
      categoryId: 'cat-food',
      villageId: 'cmsepb40r0000jv04tdwwd5cw',
      status: 'APPROVED',
      isPremium: true,
      isFeatured: true,
      coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      views: 2350,
      avgRating: 4.8,
    },
    {
      title: 'బాలాజీ ఎలక్ట్రికల్స్, మోటార్స్ & హార్డ్‌వేర్',
      slug: 'balaji-electricals-choutuppal',
      description: 'సబ్మర్సిబుల్ మోటార్లు, కేబుల్ వైరింగ్, ఎల్ఈడీ లైట్లు, ఫ్యాన్లు మరియు వ్యవసాయ మోటార్ల రిపేరింగ్ & సేల్స్.',
      phone: '9494348175',
      whatsapp: '9494348175',
      address: 'గాంధీ చౌక్, చౌటుప్పల్',
      categoryId: 'cat-electrical',
      villageId: 'cmsepb40r0000jv04tdwwd5cw',
      status: 'APPROVED',
      isPremium: true,
      isFeatured: true,
      coverImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      views: 940,
      avgRating: 4.7,
    },
    {
      title: 'శ్రీ వెంకటేశ్వర మెడికల్ & జనరల్ స్టోర్స్',
      slug: 'venkateshwara-medical-general-stores',
      description: 'అన్ని రకాల ఇంగ్లీష్ మందులు, సర్జికల్ ఐటమ్స్, బేబీ కేర్ ఉత్పత్తులు & 24 గంటల ఎమర్జెన్సీ మెడిసిన్ సప్లై.',
      phone: '9849123456',
      whatsapp: '9849123456',
      address: 'ప్రభుత్వ ఆసుపత్రి ఎదురుగా, చౌటుప్పల్',
      categoryId: 'cat-medical',
      villageId: 'cmsepb40r0000jv04tdwwd5cw',
      status: 'APPROVED',
      isPremium: false,
      isFeatured: true,
      coverImage: 'https://images.unsplash.com/photo-1586015555751-63c299c80521?auto=format&fit=crop&w=800&q=80',
      views: 1120,
      avgRating: 4.9,
    },
    {
      title: 'శ్రీ లక్ష్మీ కిరాణా & హోల్‌సేల్ జనరల్ మర్చంట్స్',
      slug: 'sri-lakshmi-kirana-general-stores',
      description: 'నాణ్యమైన బియ్యం, పప్పులు, నూనెలు, మసాలా దినుసులు మరియు అన్ని రకాల నిత్యావసర వస్తువులు హోల్‌సేల్ ధరలకే లభించును.',
      phone: '9988776655',
      whatsapp: '9988776655',
      address: 'మార్కెట్ యార్డ్ రోడ్, చౌటుప్పల్',
      categoryId: 'cat-agencies',
      villageId: 'cmsepb40r0000jv04tdwwd5cw',
      status: 'APPROVED',
      isPremium: false,
      isFeatured: false,
      coverImage: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',
      views: 880,
      avgRating: 4.6,
    },
    {
      title: 'గాయత్రి మీసేవ, ఆధార్ & ఇంటర్నెట్ డిజిటల్ పాయింట్',
      slug: 'gayatri-meeseva-internet-digital-point',
      description: 'పాస్‌పోర్ట్, ఆధార్ సర్వీసెస్, పాన్ కార్డు, రైతు బంధు, పట్టాదారు పాస్‌బుక్, ధరణి స్లాట్ బుకింగ్, కలర్ జిరాక్స్ & లామినేషన్.',
      phone: '9876543210',
      whatsapp: '9876543210',
      address: 'తహసీల్దార్ ఆఫీస్ ప్రక్కన, చౌటుప్పల్',
      categoryId: 'cat-internet',
      villageId: 'cmsepb40r0000jv04tdwwd5cw',
      status: 'APPROVED',
      isPremium: true,
      isFeatured: true,
      coverImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
      views: 1540,
      avgRating: 4.9,
    },
    {
      title: 'శివ సాయి ఆటో గ్యారేజ్ & వాషింగ్ సెంటర్',
      slug: 'shiva-sai-auto-garage-washing-center',
      description: 'అన్ని రకాల కార్లు & బైక్స్ కంప్లీట్ సర్వీసింగ్, వాషింగ్, ఆయిల్ చేంజ్, డెంటింగ్ & పెయింటింగ్ నిపుణులచే చేయబడును.',
      phone: '9440123456',
      whatsapp: '9440123456',
      address: 'లింగోజిగూడ రోడ్, చౌటుప్పల్',
      categoryId: 'cmso8tgy60002v35o914xbblk',
      villageId: 'v-lingojiguda',
      status: 'APPROVED',
      isPremium: false,
      isFeatured: false,
      coverImage: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
      views: 620,
      avgRating: 4.7,
    },
    {
      title: 'చౌటుప్పల్ రియల్ ఎస్టేట్ & ఓపెన్ ప్లాట్స్ కన్సల్టెన్సీ',
      slug: 'choutuppal-real-estate-open-plots-consultancy',
      description: 'హైదరాబాద్ - విజయవాడ హైవే ఫేసింగ్ HMDA / DTCP అప్రూవ్డ్ ఓపెన్ ప్లాట్లు, విల్లాలు, ఫామ్‌ల్యాండ్స్ సేల్స్ & రిజిస్ట్రేషన్ సర్వీస్.',
      phone: '9494348175',
      whatsapp: '9494348175',
      address: 'హైవే జంక్షన్, చౌటుప్పల్',
      categoryId: 'cat-realestate',
      villageId: 'cmsepb40r0000jv04tdwwd5cw',
      status: 'APPROVED',
      isPremium: true,
      isFeatured: true,
      coverImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
      views: 3100,
      avgRating: 5.0,
    },
    {
      title: 'నవభారత్ బిల్డింగ్ మెటీరియల్స్ & సిమెంట్ ఏజెన్సీ',
      slug: 'navabharat-building-materials-cement-agency',
      description: 'టాటా టిస్కాన్ స్టీల్, అల్ట్రాటెక్ సిమెంట్, ఇసుక, కంకర, బ్రిక్స్ హోల్‌సేల్ మరియు రిటైల్ సరఫరా.',
      phone: '9848012345',
      whatsapp: '9848012345',
      address: 'ఇండస్ట్రియల్ ఏరియా రోడ్, చౌటుప్పల్',
      categoryId: 'cat-building',
      villageId: 'cmsepb40r0000jv04tdwwd5cw',
      status: 'APPROVED',
      isPremium: false,
      isFeatured: false,
      coverImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
      views: 750,
      avgRating: 4.8,
    },
    {
      title: 'శ్రీనివాస ఫర్నిచర్ & హోమ్ డెకార్స్',
      slug: 'srinivasa-furniture-home-decors-choutuppal',
      description: 'టీక్‌వుడ్ డబుల్ కాట్స్, సోఫా సెట్లు, డైనింగ్ టేబుల్స్, వార్డ్‌రోబ్స్, ఆఫీస్ చైర్స్ & మోడ్రన్ హోమ్ ఫర్నిషింగ్.',
      phone: '9123456789',
      whatsapp: '9123456789',
      address: 'షాపింగ్ కాంప్లెక్స్, చౌటుప్పల్',
      categoryId: 'cat-furniture',
      villageId: 'cmsepb40r0000jv04tdwwd5cw',
      status: 'APPROVED',
      isPremium: true,
      isFeatured: false,
      coverImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
      views: 1390,
      avgRating: 4.9,
    },
  ]

  for (const item of listingsToSeed) {
    await prisma.listing.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        description: item.description,
        phone: item.phone,
        whatsapp: item.whatsapp,
        address: item.address,
        categoryId: item.categoryId,
        villageId: item.villageId,
        status: item.status,
        isPremium: item.isPremium,
        isFeatured: item.isFeatured,
        coverImage: item.coverImage,
        views: item.views,
        avgRating: item.avgRating,
      },
      create: {
        ...item,
        ownerId: adminUser.id,
      },
    })
  }

  // 5. Populate Banners
  const bannersToSeed = [
    {
      title: 'మీ వ్యాపారాన్ని చౌటుప్పల్ యాప్ ద్వారా వేలమందికి చేర్చండి!',
      imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80',
      link: 'https://wa.me/919494348175?text=' + encodeURIComponent('నా షాప్ యాడ్ ఇవ్వాలనుకుంటున్నాను'),
      position: 'HOME_TOP',
      status: 'APPROVED',
      isActive: true,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      ownerId: adminUser.id,
    },
    {
      title: 'చౌటుప్పల్ హైవే ఫేసింగ్ HMDA ఓపెన్ ప్లాట్లు - స్పెషల్ ఆఫర్',
      imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
      link: '/real-estate',
      position: 'HOME_TOP',
      status: 'APPROVED',
      isActive: true,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      ownerId: adminUser.id,
    },
    {
      title: 'గ్రాండ్ ఫ్యామిలీ రెస్టారెంట్ - వీకెండ్ స్పెషల్ బిర్యానీ కాంబో',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
      link: '/explore?category=food-dining',
      position: 'HOME_MIDDLE',
      status: 'APPROVED',
      isActive: true,
      expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      ownerId: adminUser.id,
    },
  ]

  for (const b of bannersToSeed) {
    const existing = await prisma.banner.findFirst({ where: { title: b.title } })
    if (existing) {
      await prisma.banner.update({ where: { id: existing.id }, data: b })
    } else {
      await prisma.banner.create({ data: b })
    }
  }

  // 6. Populate Stories
  const storiesToSeed = [
    {
      caption: 'నయా షాపుల రిజిస్ట్రేషన్ ఓపెన్! మీ వ్యాపారాన్ని ఇప్పుడే నమోదు చేసుకోండి.',
      mediaUrl: 'https://images.unsplash.com/photo-1556742049-0a67e557b6f6?auto=format&fit=crop&w=800&q=80',
      mediaType: 'IMAGE',
      link: '/add-business',
      isActive: true,
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      ownerId: adminUser.id,
    },
    {
      caption: 'చౌటుప్పల్ బైపాస్ రోడ్డు అప్‌డేట్ & తాజా సమాచారం',
      mediaUrl: 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&w=800&q=80',
      mediaType: 'IMAGE',
      link: '/news',
      isActive: true,
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      ownerId: adminUser.id,
    },
    {
      caption: 'కొత్త రియల్ ఎస్టేట్ వెంచర్ లాంచ్ @ కొయ్యలగూడెం రోడ్',
      mediaUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
      mediaType: 'IMAGE',
      link: '/real-estate',
      isActive: true,
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      ownerId: adminUser.id,
    },
  ]

  for (const s of storiesToSeed) {
    const existing = await prisma.story.findFirst({ where: { caption: s.caption } })
    if (existing) {
      await prisma.story.update({ where: { id: existing.id }, data: s })
    } else {
      await prisma.story.create({ data: s })
    }
  }

  // 7. Populate Shorts / Reels
  const shortsToSeed = [
    {
      title: 'చౌటుప్పల్ మున్సిపాలిటీ & మార్కెట్ డెవలప్‌మెంట్ డ్రోన్ వ్యూ',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      youtubeId: 'dQw4w9WgXcQ',
      platform: 'YOUTUBE',
      thumbnail: 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&w=800&q=80',
      description: 'చౌటుప్పల్ టౌన్ మరియు జాతీయ రహదారి 65 అందమైన డ్రోన్ విజువల్స్.',
      views: 1850,
      likes: 142,
      ownerId: adminUser.id,
    },
    {
      title: 'రాయల్ గ్రాండ్ రెస్టారెంట్ స్పెషల్ మటన్ బిర్యానీ మేకింగ్',
      videoUrl: 'https://www.youtube.com/watch?v=L_LUpnjgPso',
      youtubeId: 'L_LUpnjgPso',
      platform: 'YOUTUBE',
      thumbnail: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      description: 'చౌటుప్పల్‌లో ఫేమస్ హైదరాబాద్ దమ్ బిర్యానీ తయారీ లైవ్.',
      views: 2400,
      likes: 210,
      ownerId: adminUser.id,
    },
  ]

  for (const sh of shortsToSeed) {
    const existing = await prisma.short.findFirst({ where: { title: sh.title } })
    if (existing) {
      await prisma.short.update({ where: { id: existing.id }, data: sh })
    } else {
      await prisma.short.create({ data: sh })
    }
  }

  // 8. Populate Ticker Items Setting
  const tickerItems = [
    {
      id: 'tick_1',
      text: 'చౌటుప్పల్ సూపర్ యాప్‌లోకి స్వాగతం! మీ వ్యాపారాన్ని ఉచితంగా రిజిస్టర్ చేసుకోండి.',
      link: '/add-business',
      isActive: true,
      isUrgent: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tick_2',
      text: '24/7 అత్యవసర సేవలు, ఎలక్ట్రీషియన్, ప్లంబర్ కాంటాక్ట్స్ అందుబాటులో ఉన్నాయి.',
      link: '/explore?category=services',
      isActive: true,
      isUrgent: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tick_3',
      text: 'హైవే ఫేసింగ్ HMDA అప్రూవ్డ్ ఓపెన్ ప్లాట్ల కోసం రియల్ ఎస్టేట్ సెక్షన్ చూడండి.',
      link: '/real-estate',
      isActive: true,
      isUrgent: true,
      createdAt: new Date().toISOString(),
    },
  ]

  await prisma.setting.upsert({
    where: { key: 'ticker_items_json' },
    update: { value: JSON.stringify(tickerItems) },
    create: { key: 'ticker_items_json', value: JSON.stringify(tickerItems) },
  })

  await prisma.setting.upsert({
    where: { key: 'announcement_ticker' },
    update: { value: tickerItems.map((t) => t.text).join(' | ') },
    create: { key: 'announcement_ticker', value: tickerItems.map((t) => t.text).join(' | ') },
  })

  console.log('--- Admin & Live Data Sync Completed Successfully ---')
}

seedAdminData().catch(console.error)
