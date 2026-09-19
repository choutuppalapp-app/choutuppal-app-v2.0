export interface ListingItem {
  name: string
  category: string
  phone: string
  address: string
}

export const listings: ListingItem[] = [
  {
    name: 'Sri Sai Ram Electricals & Plumber Works',
    category: 'Electrician',
    phone: '9494348175',
    address: 'Main Road, Near Bus Stand, Choutuppal',
  },
  {
    name: 'Bhavani Electrical Works & Rewinding',
    category: 'Electrician',
    phone: '9848012345',
    address: 'Shiva Temple Street, Choutuppal',
  },
  {
    name: 'Venkateshwara Medical & General Stores',
    category: 'Medical',
    phone: '9849123456',
    address: 'Opp. Community Hospital, Choutuppal',
  },
  {
    name: 'Sri Lakshmi Kirana & General Stores',
    category: 'Kirana',
    phone: '9988776655',
    address: 'Gandhi Chowk, Choutuppal',
  },
  {
    name: 'Gayatri Plumbing & Sanitary Hardware',
    category: 'Plumber',
    phone: '9876543210',
    address: 'NH 65 Bypass, Choutuppal',
  },
  {
    name: 'Choutuppal Real Estate & Land Developers',
    category: 'Real Estate',
    phone: '9440123456',
    address: 'Hyderabad Highway, Choutuppal',
  },
]
