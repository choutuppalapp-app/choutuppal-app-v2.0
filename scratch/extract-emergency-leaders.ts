import fs from 'fs'
import path from 'path'

// Structured Emergency & Leaders Contacts Extracted from Choutuppal PDFs
const emergencyLeadersData = [
  // Emergency Services & Police
  { name: 'Police Helpline', phone: '100', designation: 'Emergency Police Control Room' },
  { name: 'Ambulance Helpline', phone: '108', designation: 'Emergency Ambulance Services (108)' },
  { name: 'Fire Station Helpline', phone: '101', designation: 'Fire Station Emergency (101)' },
  { name: 'Arogyasri Helpline', phone: '104', designation: 'Arogyasri Medical Helpline (104)' },
  { name: 'She Team Helpline', phone: '9490617111', designation: 'She Team Emergency Police' },
  { name: 'G. Manmadha Kumar', phone: '8712662481', designation: 'Police Inspector Choutuppal' },
  { name: 'N. Krishna Murthy', phone: '8771258018', designation: 'Sub-Inspector Police Choutuppal' },
  { name: 'K. Yadagiri', phone: '9492359110', designation: 'Sub-Inspector Police Choutuppal' },
  { name: 'C. Yadavareddy', phone: '8555872362', designation: 'Sub-Inspector Police Choutuppal' },
  { name: 'M. Lakshmaiah', phone: '8712580129', designation: 'Sub-Inspector Police Choutuppal' },
  { name: 'Bhongir Town CI', phone: '9440795645', designation: 'Bhongir Town Police CI' },
  { name: 'Bhongir Rural CI', phone: '9440795642', designation: 'Bhongir Rural Police CI' },

  // Government Offices & Officials
  { name: 'Hanumanthu Rao', phone: '8331997001', designation: 'District Collector Yadadri Bhongir' },
  { name: 'Ravi Gupta', phone: '8331997002', designation: 'Joint Collector Yadadri Bhongir' },
  { name: 'R. Mahendar Reddy', phone: '8331997003', designation: 'DRO Yadadri Bhongir' },
  { name: 'M.V. Bhupal Reddy', phone: '8331997004', designation: 'RDO Bhongir' },
  { name: 'V. Shekhar Reddy', phone: '8331997005', designation: 'RDO Revenue Divisional Officer Choutuppal' },
  { name: 'John Mohan', phone: '8331997006', designation: 'AO Collectorate Yadadri Bhongir' },
  { name: 'Veerabai', phone: '8331997020', designation: 'Tahsildar Choutuppal Mandal' },
  { name: 'P. Siddhartha', phone: '9505267778', designation: 'Deputy Tahsildar Choutuppal' },
  { name: 'Bojja Sandeep Kumar', phone: '9989059012', designation: 'MPDO Mandal Development Officer Choutuppal' },
  { name: 'D. Srinivas Kumar', phone: '8221997016', designation: 'DAO District Agriculture Officer' },
  { name: 'Y. Nithish Kumar', phone: '9121136770', designation: 'AE Panchayati Raj Choutuppal' },
  { name: 'G. Jagadeesh', phone: '8897811393', designation: 'CPO Yadadri Bhongir' },
  { name: 'Venugopal Reddy', phone: '9849905913', designation: 'Municipal Commissioner Choutuppal' },
  { name: 'Dr. Madhusudhan', phone: '9989997697', designation: 'District Medical Officer' },
  { name: 'K. Pramod', phone: '9333815944', designation: 'Arogyasri District Manager' },
  { name: 'Agriculture Officer', phone: '7288894513', designation: 'Agricultural Officer Choutuppal' },
  { name: 'Market Secretary', phone: '7330733596', designation: 'Agricultural Market Committee Secretary' },

  // Electricity & Utility Officers
  { name: 'Current Substation Choutuppal', phone: '9491065911', designation: 'Electricity Substation Emergency' },
  { name: 'IPDC Current Substation', phone: '7382615170', designation: 'Power Substation Choutuppal' },
  { name: 'AE Transco Electrical', phone: '9440813595', designation: 'AE Transco Power Emergency' },
  { name: 'DE OP Choutuppal', phone: '7901093658', designation: 'Divisional Engineer Electricity' },
  { name: 'AOE OP Choutuppal', phone: '9440813567', designation: 'Assistant Divisional Engineer Power' },

  // Political Leaders & Public Representatives
  { name: 'Komatireddy Rajagopal Reddy', phone: '9866911221', designation: 'MLA Munugode Assembly Constituency' },
  { name: 'Chamala Kiran Kumar Reddy', phone: '9908355699', designation: 'MP Bhongir Lok Sabha' },
  { name: 'Gutta Amit Reddy', phone: '9989222288', designation: 'MP Nalgonda Lok Sabha' },
  { name: 'Teenmar Mallanna', phone: '9866524314', designation: 'MLC Legislative Council Member' },
  { name: 'Beerla Ailaiah', phone: '9948297777', designation: 'DCC President & Public Representative' },
  { name: 'Karne Prabhakar', phone: '9618883555', designation: 'Ex MLC Leader' },
  { name: 'Kusukuntla Prabhakar Reddy', phone: '9908500369', designation: 'Ex MLA Munugode' },
  { name: 'Chilukuri Prabhakar Reddy', phone: '9908899488', designation: 'Ex ZPTC Member Choutuppal' },
  { name: 'Taduri Venkata Reddy', phone: '9505100555', designation: 'Ex MPP President Choutuppal' },
  { name: 'Venreddy Raju', phone: '9848269754', designation: 'Ex Municipal Chairman Choutuppal' },
  { name: 'Venkateshwar Nayak', phone: '9849904150', designation: 'Municipal Leader Choutuppal' },
  { name: 'Ubbu Venkataiah', phone: '9848760477', designation: 'Public Leader Choutuppal' },

  // Hospitals & Medical Centers
  { name: 'Choutuppal Community Health Center', phone: '9948595002', designation: 'CHC Hospital Superintendent' },
  { name: 'Bhongir Government Hospital', phone: '7702544000', designation: 'District Government Hospital Bhongir' },
  { name: 'Ramannapet CHC Hospital', phone: '8008553205', designation: 'Community Health Center Ramannapet' },
  { name: 'Aleru Community Health Center', phone: '8008039691', designation: 'Government Hospital Aleru' },
  { name: 'Bhagyasri Hospital & Eye Care', phone: '9848732428', designation: 'Eye Hospital Choutuppal' },
  { name: 'Dr. V. Narsimha Vemula', phone: '9848732428', designation: 'General Physician & Eye Specialist' },

  // Banks & Financial Institutions
  { name: 'SBI Choutuppal Branch', phone: '08694-272230', designation: 'State Bank of India Choutuppal Main Branch' },
  { name: 'Canara Bank Choutuppal', phone: '9948485483', designation: 'Canara Bank Choutuppal Branch' },
  { name: 'HDFC Bank Choutuppal', phone: '9848730946', designation: 'HDFC Bank Main Road Choutuppal' },
  { name: 'Axis Bank Choutuppal', phone: '9848730946', designation: 'Axis Bank Choutuppal Branch' },
]

async function extractEmergencyLeaders() {
  const targetCsv = 'C:\\Users\\Citizen2\\Desktop\\Choutuppal_Emergency_Leaders.csv'
  console.log(`Writing ${emergencyLeadersData.length} Emergency & Leaders contacts to CSV: ${targetCsv}`)

  const csvRows = ['phone_number,name,designation']
  for (const item of emergencyLeadersData) {
    const cleanPhone = item.phone.replace(/\D/g, '')
    const phone = cleanPhone.length === 10 ? `+91${cleanPhone}` : item.phone
    csvRows.push(`"${phone}","${item.name.replace(/"/g, '""')}","${item.designation.replace(/"/g, '""')}"`)
  }

  fs.writeFileSync(targetCsv, csvRows.join('\n'), 'utf8')
  console.log(`SUCCESS! Saved ${csvRows.length - 1} records to ${targetCsv}`)
}

extractEmergencyLeaders()
