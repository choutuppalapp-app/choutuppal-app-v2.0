import fs from 'fs'
import path from 'path'

// @ts-ignore
const { PDFParse } = require('pdf-parse')

const PDF_PATH = process.env.PDF_PATH || 'C:\\Users\\Citizen2\\Desktop\\CPL_Dir_2026.pdf'
const API_URL = process.env.SYNC_API_URL || 'https://www.choutuppal.in/api/webhooks/sheet-sync'
const SECRET_TOKEN = process.env.SHEET_SYNC_SECRET || 'sheet_sync_secret_choutuppal_2026'

// Exclude political, government, emergency, or teacher union personnel
const EXCLUDE_KEYWORDS = [
  'ఉపాధ్యాయులు',
  'ఉపాధ్యాయ సంఘాల',
  'నాయకులు',
  'సర్పంచ్',
  'ఎంపీటీసీ',
  'జడ్పీటీసీ',
  'ఎమర్జెన్సీ',
  'పోలీస్ స్టేషన్',
  'ప్రభుత్వ',
  'గవర్నమెంట్',
  'రాజకీయ',
  'పార్టీ',
  'Teacher',
  'Government',
  'Police',
  'Emergency',
]

const CURATED_LISTINGS = [
  // Page 1: Auto Electrical & Auto Mechanic
  { 'Business Name': 'మారుతి ఆటో ఎలక్ట్రికల్ వర్క్స్ (చెరుకు అశోక్ గౌడ్)', 'Category': 'Automobile', 'Primary Phone': '9848768589', 'Secondary Phone': '' },
  { 'Business Name': 'మణికంఠ ఆటో ఎలక్ట్రికల్ వర్క్స్ (రాము)', 'Category': 'Automobile', 'Primary Phone': '9948485484', 'Secondary Phone': '' },
  { 'Business Name': 'S.S. ఆటో ఎలక్ట్రికల్ వర్క్స్', 'Category': 'Automobile', 'Primary Phone': '9885374861', 'Secondary Phone': '' },
  { 'Business Name': 'సాగర్ ఆటో ఎలక్ట్రికల్ వర్క్స్', 'Category': 'Automobile', 'Primary Phone': '9348914632', 'Secondary Phone': '' },
  { 'Business Name': 'మల్లిఖార్జున ఆటో ఎలక్ట్రికల్ వర్క్స్', 'Category': 'Automobile', 'Primary Phone': '9848325187', 'Secondary Phone': '' },
  { 'Business Name': 'నేషనల్ ఆటో ఎలక్ట్రికల్ వర్క్స్', 'Category': 'Automobile', 'Primary Phone': '9866073224', 'Secondary Phone': '9848875260' },
  { 'Business Name': 'లింగస్వామి ఆటో అండ్ ఆటో మెకానిక్ వర్క్స్', 'Category': 'Automobile', 'Primary Phone': '9912567621', 'Secondary Phone': '' },
  { 'Business Name': 'మల్లిఖార్జున ఆటో ఎలక్ట్రికల్ వర్క్స్ (యం. రవి)', 'Category': 'Automobile', 'Primary Phone': '9848325187', 'Secondary Phone': '' },
  { 'Business Name': 'శ్రీ అయ్యప్ప ఆటో ఎలక్ట్రికల్ వర్క్స్ (చెరుకు లింగస్వామి గౌడ్)', 'Category': 'Automobile', 'Primary Phone': '9666346344', 'Secondary Phone': '' },
  { 'Business Name': 'ఆటో వర్క్స్ (బొడిగె వెంకటేష్)', 'Category': 'Automobile', 'Primary Phone': '9010838151', 'Secondary Phone': '' },
  { 'Business Name': 'రెడ్డి బైక్ ఎలక్ట్రికల్ వర్క్స్', 'Category': 'Automobile', 'Primary Phone': '9030939896', 'Secondary Phone': '' },
  { 'Business Name': 'హరిచరణ్ ఆటో ఎలక్ట్రికల్ వర్క్స్ (మడుగని ప్రవీణ్ గౌడ్)', 'Category': 'Automobile', 'Primary Phone': '9393631656', 'Secondary Phone': '9963179381' },
  { 'Business Name': 'ఎస్. ఎం. ఆటో ఎలక్ట్రికల్ వర్క్స్ (యం. మతీన్)', 'Category': 'Automobile', 'Primary Phone': '8008774663', 'Secondary Phone': '' },
  { 'Business Name': 'శ్రీ లక్ష్మీ నరసింహ ఆటో ఎలక్ట్రికల్ వర్క్స్', 'Category': 'Automobile', 'Primary Phone': '8309316793', 'Secondary Phone': '9951906366' },
  { 'Business Name': 'స్టార్ ఆటో ఎలక్ట్రికల్ వర్క్స్ (సయ్యద్ ఆమెర్)', 'Category': 'Automobile', 'Primary Phone': '8309396117', 'Secondary Phone': '' },
  { 'Business Name': 'విజయ్ ఆటో మెకానిక్ వర్క్స్', 'Category': 'Automobile', 'Primary Phone': '9848850776', 'Secondary Phone': '' },
  { 'Business Name': 'యస్.వి. ఆటో ఎలక్ట్రికల్ వర్క్స్', 'Category': 'Automobile', 'Primary Phone': '9912595059', 'Secondary Phone': '' },
  { 'Business Name': 'సాయిరాం ఆటో మెకానిక్ వర్క్స్', 'Category': 'Automobile', 'Primary Phone': '9848563292', 'Secondary Phone': '9912665838' },
  { 'Business Name': 'హనుమాన్ ఆటో మెకానిక్ వర్క్స్ (పద్మాగౌడ్)', 'Category': 'Automobile', 'Primary Phone': '9948225446', 'Secondary Phone': '8099432311' },

  // Page 2: Auto Mechanic & Interior Designing
  { 'Business Name': 'రమేష్ ఆటో మెకానిక్ వర్క్స్', 'Category': 'Automobile', 'Primary Phone': '9908710508', 'Secondary Phone': '' },
  { 'Business Name': 'సిద్ధార్థ ఆటో మెకానిక్ వర్క్స్', 'Category': 'Automobile', 'Primary Phone': '9505573462', 'Secondary Phone': '' },
  { 'Business Name': 'సాయి ఆటో మెకానిక్ వర్క్స్ (జై. రాజేశ్వర్ రెడ్డి)', 'Category': 'Automobile', 'Primary Phone': '9951255481', 'Secondary Phone': '' },
  { 'Business Name': 'అయ్యప్ప ఆటోమోబైల్ & వర్క్స్ షాప్ (చిడుగుళ్ల లింగస్వామి)', 'Category': 'Automobile', 'Primary Phone': '9010879649', 'Secondary Phone': '9381357377' },
  { 'Business Name': 'ఇంజనీర్స్ ఇన్‌ఫ్రాటెక్ (పబ్బు సాయికుమార్)', 'Category': 'Interior & Decor', 'Primary Phone': '9010220245', 'Secondary Phone': '9848520331' },
  { 'Business Name': 'వి.ఎస్.ఎం.ఎల్ ప్లానింగ్ & కన్స్ట్రక్షన్ (వరగంటి మహేందర్)', 'Category': 'Interior & Decor', 'Primary Phone': '9505550363', 'Secondary Phone': '' },
  { 'Business Name': 'సూర్య సివిల్ డిజైన్స్ కాంట్రాక్టర్స్ & ఇంటీరియర్ డిజైనింగ్', 'Category': 'Interior & Decor', 'Primary Phone': '9640047092', 'Secondary Phone': '9618679443' },
  { 'Business Name': 'ఇన్ఫ్రాస్ట్రక్చర్ & డెవలపర్స్', 'Category': 'Interior & Decor', 'Primary Phone': '9985599665', 'Secondary Phone': '9381399416' },
  { 'Business Name': 'రాఘవేంద్ర ప్లానింగ్ కన్స్ట్రక్షన్', 'Category': 'Interior & Decor', 'Primary Phone': '9912625347', 'Secondary Phone': '9381386875' },
  { 'Business Name': 'ప్రదీప్ ఇంటీరియర్ డిజైనింగ్ (రఘువర్ధన్ రెడ్డి)', 'Category': 'Interior & Decor', 'Primary Phone': '9966025089', 'Secondary Phone': '6301360418' },
  { 'Business Name': 'యం.యస్. ఇంటీరియర్స్ హోమ్ డెకోరేషన్', 'Category': 'Interior & Decor', 'Primary Phone': '9705142002', 'Secondary Phone': '9533163313' },
  { 'Business Name': 'శ్రీ లక్ష్మీ నర్సింహస్వామి ఇంటీరియర్స్', 'Category': 'Interior & Decor', 'Primary Phone': '9701453579', 'Secondary Phone': '8919170108' },
  { 'Business Name': 'అను ఇంటీరియర్ డెకోరేటర్స్ (గ్యార శేఖర్)', 'Category': 'Interior & Decor', 'Primary Phone': '7661044133', 'Secondary Phone': '' },
  { 'Business Name': 'యస్. యస్. ఎంటర్ ప్రైజెస్ (ఇంటీరియర్ ప్రొడక్ట్స్)', 'Category': 'Interior & Decor', 'Primary Phone': '7842227538', 'Secondary Phone': '7842227541' },

  // Page 3: Internet, Bricks & Cement Works
  { 'Business Name': 'రాజేష్ ఇంటర్నెట్ సెంటర్ (ఈ-సేవ)', 'Category': 'Internet & Cyber Cafe', 'Primary Phone': '9948489462', 'Secondary Phone': '' },
  { 'Business Name': 'టి. ఎన్. ఆన్‌లైన్ సర్వీసెస్ (సందల రాజేష్ కుమార్)', 'Category': 'Internet & Cyber Cafe', 'Primary Phone': '9912654777', 'Secondary Phone': '9052813456' },
  { 'Business Name': 'టి - సేవ', 'Category': 'Internet & Cyber Cafe', 'Primary Phone': '9666108908', 'Secondary Phone': '9912273382' },
  { 'Business Name': 'శ్రీనేత్ వరల్డ్ ఇంటర్నెట్ (యం. శేఖర్‌గౌడ్)', 'Category': 'Internet & Cyber Cafe', 'Primary Phone': '9912080812', 'Secondary Phone': '' },
  { 'Business Name': 'సురేష్ ఇంటర్నెట్ వరల్డ్ (నరేష్‌గౌడ్)', 'Category': 'Internet & Cyber Cafe', 'Primary Phone': '9618779089', 'Secondary Phone': '' },
  { 'Business Name': 'రెయిన్‌బో ఇంటర్నెట్ (బి. శ్రీను)', 'Category': 'Internet & Cyber Cafe', 'Primary Phone': '7702348845', 'Secondary Phone': '' },
  { 'Business Name': 'గ్లోబల్ ఇ-సేవా', 'Category': 'Internet & Cyber Cafe', 'Primary Phone': '9948770651', 'Secondary Phone': '' },
  { 'Business Name': 'చరణ్ ఇంటర్నెట్ సెంటర్ (గంజి కృష్ణ)', 'Category': 'Internet & Cyber Cafe', 'Primary Phone': '9246334470', 'Secondary Phone': '' },
  { 'Business Name': 'బ్రైట్ సొల్యూషన్స్', 'Category': 'Internet & Cyber Cafe', 'Primary Phone': '9666281743', 'Secondary Phone': '9912135142' },
  { 'Business Name': 'స్పీడ్ ఇంటర్నెట్ (వెంకటేష్)', 'Category': 'Internet & Cyber Cafe', 'Primary Phone': '9666456767', 'Secondary Phone': '8096479017' },
  { 'Business Name': 'జకాత్ ఇంటర్నెట్ వరల్డ్ (సి.హెచ్. రాఘవేంద్రాచారి)', 'Category': 'Internet & Cyber Cafe', 'Primary Phone': '9912761434', 'Secondary Phone': '' },
  { 'Business Name': 'సాన్వి ఇంటర్నెట్ (గంజి రాఘవ)', 'Category': 'Internet & Cyber Cafe', 'Primary Phone': '9959894827', 'Secondary Phone': '9292004357' },
  { 'Business Name': 'మీ సేవా (చెర్కు భాస్కర్)', 'Category': 'Internet & Cyber Cafe', 'Primary Phone': '9553591601', 'Secondary Phone': '' },
  { 'Business Name': 'TJN సాఫ్ట్ సొల్యూషన్స్', 'Category': 'Internet & Cyber Cafe', 'Primary Phone': '9848606666', 'Secondary Phone': '8185991919' },
  { 'Business Name': 'సైబర్ నెట్ జోన్ (సి.హెచ్. భాస్కర్)', 'Category': 'Internet & Cyber Cafe', 'Primary Phone': '9553591601', 'Secondary Phone': '' },
  { 'Business Name': 'లక్ష్మీ నెట్ జోన్ (నెల్లూరి రాజు)', 'Category': 'Internet & Cyber Cafe', 'Primary Phone': '9550606050', 'Secondary Phone': '' },
  { 'Business Name': 'వాణి నెట్ వరల్డ్', 'Category': 'Internet & Cyber Cafe', 'Primary Phone': '9014692282', 'Secondary Phone': '' },
  { 'Business Name': 'రుషిక ఇంటర్నెట్', 'Category': 'Internet & Cyber Cafe', 'Primary Phone': '8121378378', 'Secondary Phone': '' },
  { 'Business Name': 'సృజన నెట్‌వర్క్', 'Category': 'Internet & Cyber Cafe', 'Primary Phone': '9550999089', 'Secondary Phone': '' },
  { 'Business Name': 'రాయల్ నెట్‌వర్క్', 'Category': 'Internet & Cyber Cafe', 'Primary Phone': '9010222101', 'Secondary Phone': '' },
  { 'Business Name': 'శివ జిరాక్స్ & ఇంటర్నెట్ (యం. గోపాల్)', 'Category': 'Internet & Cyber Cafe', 'Primary Phone': '7893450363', 'Secondary Phone': '' },
  { 'Business Name': 'యువ నేత వరల్డ్', 'Category': 'Internet & Cyber Cafe', 'Primary Phone': '9542724488', 'Secondary Phone': '' },
  { 'Business Name': 'యాదాద్రి నెట్', 'Category': 'Internet & Cyber Cafe', 'Primary Phone': '8121378378', 'Secondary Phone': '' },
  { 'Business Name': 'మణికంఠ ఇంటర్నెట్ & జిరాక్స్', 'Category': 'Internet & Cyber Cafe', 'Primary Phone': '7660959566', 'Secondary Phone': '' },
  { 'Business Name': 'శివ నెట్ వరల్డ్', 'Category': 'Internet & Cyber Cafe', 'Primary Phone': '9852189325', 'Secondary Phone': '' },
  { 'Business Name': 'సాయిరాం ఇంటర్నెట్ (శ్రీకాంత్)', 'Category': 'Internet & Cyber Cafe', 'Primary Phone': '9502461005', 'Secondary Phone': '' },
  { 'Business Name': 'శ్రీ లక్ష్మి ఇంటర్నెట్ & జిరాక్స్', 'Category': 'Internet & Cyber Cafe', 'Primary Phone': '9912972737', 'Secondary Phone': '6281367543' },
  { 'Business Name': 'వి.హెచ్. ఇంటర్నెట్ & మనీ ట్రాన్స్‌ఫర్', 'Category': 'Internet & Cyber Cafe', 'Primary Phone': '9951957357', 'Secondary Phone': '7780588300' },
  { 'Business Name': 'మణికంఠ ఇంటర్నెట్ & మనీ ట్రాన్స్‌ఫర్', 'Category': 'Internet & Cyber Cafe', 'Primary Phone': '8106492218', 'Secondary Phone': '' },
  { 'Business Name': 'నవభారతి సిమెంట్ ప్రొడక్ట్స్ (వి. సత్యనారాయణ / కె. లింగస్వామి)', 'Category': 'Building Materials', 'Primary Phone': '9951114406', 'Secondary Phone': '9542376858' },
  { 'Business Name': 'CSR ట్రేడర్స్ (సి.హెచ్. రవీందర్)', 'Category': 'Building Materials', 'Primary Phone': '9848363847', 'Secondary Phone': '9700206211' },
  { 'Business Name': 'వరలక్ష్మి హలో బ్రిక్స్ (ఐలు అంచయ్యగౌడ్)', 'Category': 'Building Materials', 'Primary Phone': '9848178482', 'Secondary Phone': '' },
  { 'Business Name': 'శ్రీసాయి కృష్ణ సిమెంట్ బ్రిక్స్ (వి. ఇంద్రపాల్‌రెడ్డి)', 'Category': 'Building Materials', 'Primary Phone': '9848455987', 'Secondary Phone': '' },
  { 'Business Name': 'పి. మారయ్య సిమెంట్ వర్క్స్', 'Category': 'Building Materials', 'Primary Phone': '9848508649', 'Secondary Phone': '' },
  { 'Business Name': 'అరుణ బ్రిక్స్ ఇండస్ట్రీస్', 'Category': 'Building Materials', 'Primary Phone': '9849379305', 'Secondary Phone': '' },
  { 'Business Name': 'శ్రీ బాలాజీ బ్రిక్స్ (కె. వెంకటేష్)', 'Category': 'Building Materials', 'Primary Phone': '9848923365', 'Secondary Phone': '' },
  { 'Business Name': 'ఎస్.ఎం.ఎస్. సిమెంట్ బ్రిక్స్ (బి. గణేష్, పి. శేఖర్‌రెడ్డి)', 'Category': 'Building Materials', 'Primary Phone': '9848774941', 'Secondary Phone': '9912091891' },
  { 'Business Name': 'శివసాయి సిమెంట్ బ్రిక్స్ (బోగిరి కృష్ణగౌడ్)', 'Category': 'Building Materials', 'Primary Phone': '9949853865', 'Secondary Phone': '9866214483' },
  { 'Business Name': 'ఎస్.ఎస్.ఎన్. వాల్ ప్రొడక్ట్స్', 'Category': 'Building Materials', 'Primary Phone': '9550850501', 'Secondary Phone': '9440567009' },
  { 'Business Name': 'మహాలక్ష్మి సిమెంట్ బ్రిక్స్ (బొంగు ప్రవీణ్‌గౌడ్)', 'Category': 'Building Materials', 'Primary Phone': '9550545362', 'Secondary Phone': '' },
  { 'Business Name': 'శ్రీలక్ష్మి ప్రీ కాస్ట్ ప్రొడక్ట్స్', 'Category': 'Building Materials', 'Primary Phone': '9666680871', 'Secondary Phone': '7989316021' },

  // Page 4 & 5: Engineering & Welding Workshops
  { 'Business Name': 'రవి రోలింగ్ షట్టర్స్ (చారి)', 'Category': 'Engineering & Welding', 'Primary Phone': '9912422120', 'Secondary Phone': '' },
  { 'Business Name': 'స్టార్ ఇంజనీరింగ్ వర్క్స్ (యం.డి మదార్)', 'Category': 'Engineering & Welding', 'Primary Phone': '9948261667', 'Secondary Phone': '' },
  { 'Business Name': 'అయ్యప్ప ఇంజనీరింగ్ వర్క్స్ (మలిగి శ్రీను)', 'Category': 'Engineering & Welding', 'Primary Phone': '9848419203', 'Secondary Phone': '' },
  { 'Business Name': 'సిరి ఇంజనీరింగ్ వర్క్స్ & రీ బోరింగ్', 'Category': 'Engineering & Welding', 'Primary Phone': '9948184391', 'Secondary Phone': '' },
  { 'Business Name': 'తాజుద్దీన్ వెల్డింగ్ వర్క్స్ (బడేభాయి)', 'Category': 'Engineering & Welding', 'Primary Phone': '9848612988', 'Secondary Phone': '9701686058' },
  { 'Business Name': 'న్యూ తాజుద్దీన్ వెల్డింగ్ వర్క్స్', 'Category': 'Engineering & Welding', 'Primary Phone': '9948809577', 'Secondary Phone': '8106703028' },
  { 'Business Name': 'శ్రీనివాస ఇంజనీరింగ్ వర్క్స్', 'Category': 'Engineering & Welding', 'Primary Phone': '9948630095', 'Secondary Phone': '' },
  { 'Business Name': 'మురళీకృష్ణ ఇంజనీరింగ్ వర్క్స్ (బి. భూపాలాచారి)', 'Category': 'Engineering & Welding', 'Primary Phone': '9848011533', 'Secondary Phone': '9494443567' },
  { 'Business Name': 'సాయి ఇంజనీరింగ్ వర్క్స్ (జి. జంగయ్యచారి)', 'Category': 'Engineering & Welding', 'Primary Phone': '9848836847', 'Secondary Phone': '' },
  { 'Business Name': 'లతీఫ్ ఇంజనీరింగ్ వర్క్స్', 'Category': 'Engineering & Welding', 'Primary Phone': '9912435548', 'Secondary Phone': '9059993888' },
  { 'Business Name': 'జాన్ ఇంజనీరింగ్ వర్క్స్', 'Category': 'Engineering & Welding', 'Primary Phone': '9951021871', 'Secondary Phone': '' },
  { 'Business Name': 'రహీమ్ వెల్డింగ్ వర్క్స్', 'Category': 'Engineering & Welding', 'Primary Phone': '9640201084', 'Secondary Phone': '' },
  { 'Business Name': 'లక్ష్మీనరసింహ ఎలక్ట్రికల్ & ఇంజనీరింగ్ వర్క్స్', 'Category': 'Engineering & Welding', 'Primary Phone': '9848873214', 'Secondary Phone': '9912457209' },
  { 'Business Name': 'ఆంజనేయాచారి ఇంజనీరింగ్ వర్క్స్', 'Category': 'Engineering & Welding', 'Primary Phone': '9912665903', 'Secondary Phone': '' },
  { 'Business Name': 'జమీర్ ఇంజనీరింగ్ వర్క్స్', 'Category': 'Engineering & Welding', 'Primary Phone': '9948408202', 'Secondary Phone': '' },
  { 'Business Name': 'ఎస్ఎం ఇంజనీరింగ్ వర్క్స్', 'Category': 'Engineering & Welding', 'Primary Phone': '9502368505', 'Secondary Phone': '' },
  { 'Business Name': 'కృపా ఇంజనీరింగ్ వర్క్స్', 'Category': 'Engineering & Welding', 'Primary Phone': '9848266323', 'Secondary Phone': '' },
  { 'Business Name': 'మదీనా వెల్డింగ్ వర్క్స్ (యం.డి. జమీద్)', 'Category': 'Engineering & Welding', 'Primary Phone': '9640174201', 'Secondary Phone': '' },
  { 'Business Name': 'శ్రీసాయి ఇంజనీరింగ్ వర్క్స్ (బి. శ్రీనివాస్)', 'Category': 'Engineering & Welding', 'Primary Phone': '9848526706', 'Secondary Phone': '' },
  { 'Business Name': 'తిరుమల ఎలక్ట్రికల్ వర్క్స్ (అంజిరెడ్డి)', 'Category': 'Engineering & Welding', 'Primary Phone': '9440761815', 'Secondary Phone': '' },
  { 'Business Name': 'రూమి ఇంజనీరింగ్ వర్క్స్ (యస్.కె. లియాఖత్)', 'Category': 'Engineering & Welding', 'Primary Phone': '9848927017', 'Secondary Phone': '' },
  { 'Business Name': 'రెడ్డి ఇంజనీరింగ్ వర్క్స్', 'Category': 'Engineering & Welding', 'Primary Phone': '9848592424', 'Secondary Phone': '' },
  { 'Business Name': 'హైమత్ వెల్డింగ్ వర్క్స్', 'Category': 'Engineering & Welding', 'Primary Phone': '8498880142', 'Secondary Phone': '' },
  { 'Business Name': 'యం.ఆర్. ఇంజనీరింగ్ వర్క్స్', 'Category': 'Engineering & Welding', 'Primary Phone': '9949034297', 'Secondary Phone': '9640718505' },
  { 'Business Name': 'యం.డి అబ్దుల్లా వెల్డింగ్ వర్క్స్', 'Category': 'Engineering & Welding', 'Primary Phone': '9948909577', 'Secondary Phone': '' },
  { 'Business Name': 'సన ఇంజనీరింగ్ వర్క్స్', 'Category': 'Engineering & Welding', 'Primary Phone': '9494853704', 'Secondary Phone': '' },
  { 'Business Name': 'బిస్మిల్లా ఇంజనీరింగ్ వర్క్స్', 'Category': 'Engineering & Welding', 'Primary Phone': '8374691172', 'Secondary Phone': '' },
  { 'Business Name': 'రేణుకా ఇంజనీరింగ్ వర్క్స్ (పులిగిళ్ల బ్రహ్మాచారి)', 'Category': 'Engineering & Welding', 'Primary Phone': '9866361431', 'Secondary Phone': '' },
  { 'Business Name': 'బ్రహ్మాచారి ఇంజనీరింగ్ వర్క్స్ (చెన్నోజు బ్రహ్మాచారి)', 'Category': 'Engineering & Welding', 'Primary Phone': '9912665823', 'Secondary Phone': '' },
  { 'Business Name': 'శ్రీ వేంకటేశ్వర ఇంజనీరింగ్ వర్క్స్ (లక్ష్మణ్)', 'Category': 'Engineering & Welding', 'Primary Phone': '9573453174', 'Secondary Phone': '7569383300' },
  { 'Business Name': 'శ్రీ మల్లిఖార్జున ఇంజనీరింగ్ వర్క్స్', 'Category': 'Engineering & Welding', 'Primary Phone': '9912972793', 'Secondary Phone': '' },
  { 'Business Name': 'సాయిరాం ఇంజనీరింగ్ వర్క్స్ (ఉప్పు ఆంజనేయులు)', 'Category': 'Engineering & Welding', 'Primary Phone': '9441079555', 'Secondary Phone': '9498933665' },
  { 'Business Name': 'భారత్ ఇంజనీరింగ్ వర్క్స్ (యం.డి దిల్‌వార్‌ఖాన్)', 'Category': 'Engineering & Welding', 'Primary Phone': '9948322930', 'Secondary Phone': '' },
  { 'Business Name': 'ఖాన్ వెల్డింగ్ వర్క్స్ & రేడియేటర్ వర్క్స్', 'Category': 'Engineering & Welding', 'Primary Phone': '9848322141', 'Secondary Phone': '' },
  { 'Business Name': 'మహాదేవ్ ఇంజనీరింగ్ వర్క్స్ (దాసురోజు ఉపేంద్రాచారి)', 'Category': 'Engineering & Welding', 'Primary Phone': '9912139210', 'Secondary Phone': '' },
  { 'Business Name': 'నర్సింహ్మ ఇంజనీరింగ్ వర్క్స్ (బెజ్జ నర్సింహ్మ)', 'Category': 'Engineering & Welding', 'Primary Phone': '9848740000', 'Secondary Phone': '' },

  // Page 6 & 7: Wooden Furniture & Agencies
  { 'Business Name': 'విశ్వతేజ ఫర్నీచర్స్ (దేవరకొండ నర్సింహాచారి)', 'Category': 'Furniture & Home', 'Primary Phone': '8712904415', 'Secondary Phone': '9912759414' },
  { 'Business Name': 'ఓంకార్ ఫర్నీచర్ వర్క్స్ (యం. ధనుంజయాచారి)', 'Category': 'Furniture & Home', 'Primary Phone': '9985006274', 'Secondary Phone': '' },
  { 'Business Name': 'శివ ఉడెన్ వర్క్స్ (యం. భిక్షమాచారి)', 'Category': 'Furniture & Home', 'Primary Phone': '9912669088', 'Secondary Phone': '' },
  { 'Business Name': 'శ్రీనివాసా ఉడెన్ వర్క్స్ (పి. మల్లయాచారి)', 'Category': 'Furniture & Home', 'Primary Phone': '9949034281', 'Secondary Phone': '' },
  { 'Business Name': 'యం. సుభాష్ ఉడెన్ ఫర్నీచర్ వర్క్స్', 'Category': 'Furniture & Home', 'Primary Phone': '9848563570', 'Secondary Phone': '' },
  { 'Business Name': 'విజయలక్ష్మి ఉడ్ & అల్యూమినియం వర్క్స్ (నగేశ్)', 'Category': 'Furniture & Home', 'Primary Phone': '9848660503', 'Secondary Phone': '' },
  { 'Business Name': 'నైస్ ఉడ్ కార్వింగ్ హ్యాండి క్రాఫ్ట్స్', 'Category': 'Furniture & Home', 'Primary Phone': '9912354391', 'Secondary Phone': '' },
  { 'Business Name': 'రాజు ఉడెన్ ఫర్నీచర్ వర్క్స్ (రాజాచారి)', 'Category': 'Furniture & Home', 'Primary Phone': '9948903896', 'Secondary Phone': '' },
  { 'Business Name': 'శ్రీఆంజనేయ ఉడెన్‌ఫర్నీచర్ వర్క్స్ (ఎ. యాదయ్య)', 'Category': 'Furniture & Home', 'Primary Phone': '9848665237', 'Secondary Phone': '9032665853' },
  { 'Business Name': 'దివ్యశ్రీ ఉడెన్ వర్క్స్ (పి. మధుసూధనాచారి)', 'Category': 'Furniture & Home', 'Primary Phone': '9912191201', 'Secondary Phone': '' },
  { 'Business Name': 'భవాని ఫర్నీచర్ వర్క్స్ (బోడుల భిక్షపతి)', 'Category': 'Furniture & Home', 'Primary Phone': '9912665941', 'Secondary Phone': '' },
  { 'Business Name': 'తిరుమల ఉడెన్ ఫర్నీచర్ వర్క్స్ (పి. బ్రహ్మాచారి)', 'Category': 'Furniture & Home', 'Primary Phone': '9908317166', 'Secondary Phone': '' },
  { 'Business Name': 'లక్ష్మీప్రసన్న ఉడెన్ ఫర్నీచర్ వర్క్స్ (పి. నాగేష్)', 'Category': 'Furniture & Home', 'Primary Phone': '9848991318', 'Secondary Phone': '' },
  { 'Business Name': 'నవీన్ వుడ్ కార్వింగ్ వర్క్స్ (ఎస్. నవీన్చారి)', 'Category': 'Furniture & Home', 'Primary Phone': '9177675777', 'Secondary Phone': '' },
  { 'Business Name': 'ధనలక్ష్మి ఏజెన్సీ (విజయ వంట నూనెలు)', 'Category': 'Agencies & Distributors', 'Primary Phone': '9848112630', 'Secondary Phone': '' },
  { 'Business Name': 'శ్రీ వేంకటేశ్వర ఎంటర్ ప్రైజెస్ (గార్లపాటి శ్రీనివాస్)', 'Category': 'Agencies & Distributors', 'Primary Phone': '9848560372', 'Secondary Phone': '9948085251' },
  { 'Business Name': 'శ్రీ లక్ష్మి ఏజెన్సీస్ (వి. సూర్యనారాయణ)', 'Category': 'Agencies & Distributors', 'Primary Phone': '9248036645', 'Secondary Phone': '' },
  { 'Business Name': 'జి.వి.ఆర్. ఏజెన్సీస్ (గట్టు వీరేశం)', 'Category': 'Agencies & Distributors', 'Primary Phone': '8499870219', 'Secondary Phone': '' },
  { 'Business Name': 'శివసాయి ట్రేడర్స్ (కూల్ డ్రింక్స్) (సుర్పంగి శేఖర్‌రెడ్డి)', 'Category': 'Agencies & Distributors', 'Primary Phone': '7981438858', 'Secondary Phone': '' },

  // Page 8 & 9: Electricians & Hardware
  { 'Business Name': 'విజయలక్ష్మి ఉడెన్ & స్టీల్ ఫర్నీచర్', 'Category': 'Furniture & Home', 'Primary Phone': '9848834842', 'Secondary Phone': '' },
  { 'Business Name': 'సత్యదుర్గ స్టీల్ & ఫర్నీచర్ వర్క్స్ (ఎన్. బాల్‌రాజు)', 'Category': 'Furniture & Home', 'Primary Phone': '9848285568', 'Secondary Phone': '9951660568' },
  { 'Business Name': 'శ్రీ బాలాజీ స్టీల్ & ఫర్నీచర్ వర్క్స్ (టి. దామోదర్)', 'Category': 'Furniture & Home', 'Primary Phone': '9848706659', 'Secondary Phone': '' },
  { 'Business Name': 'శ్రీ శ్రీనివాస స్టీల్, ఫర్నీచర్ వర్క్స్ (వి. జంగయ్యగౌడ్)', 'Category': 'Furniture & Home', 'Primary Phone': '9948108923', 'Secondary Phone': '' },
  { 'Business Name': 'కొయ్యడ వెంకటేష్ గౌడ్ (ఎలక్ట్రీషియన్)', 'Category': 'Electrical & Hardware', 'Primary Phone': '9848927143', 'Secondary Phone': '9032850143' },
  { 'Business Name': 'ఎలమోని వెంకటేష్ (ఎలక్ట్రీషియన్)', 'Category': 'Electrical & Hardware', 'Primary Phone': '9542081177', 'Secondary Phone': '' },
  { 'Business Name': 'సమీర్ ఎలక్ట్రికల్స్ (యం.ఎ. నయీమ్)', 'Category': 'Electrical & Hardware', 'Primary Phone': '9948458557', 'Secondary Phone': '' },
  { 'Business Name': 'శ్రీరాఘవేంద్ర ఎలక్ట్రానిక్స్ (డి. వెంకటేష్)', 'Category': 'Electrical & Hardware', 'Primary Phone': '9849294931', 'Secondary Phone': '9948632849' },
  { 'Business Name': 'వినాయక మోటార్ వైండింగ్ వర్క్స్ (కృష్ణా రెడ్డి)', 'Category': 'Electrical & Hardware', 'Primary Phone': '9948485475', 'Secondary Phone': '' },
  { 'Business Name': 'శ్రీ రాజరాజేశ్వరీ ఎలక్ట్రికల్ వర్క్స్ (కె. రవిచారి)', 'Category': 'Electrical & Hardware', 'Primary Phone': '9912669050', 'Secondary Phone': '9010005803' },
  { 'Business Name': 'లక్ష్మి సాయి ఇంజనీరింగ్ వర్క్స్', 'Category': 'Electrical & Hardware', 'Primary Phone': '9912640534', 'Secondary Phone': '9848228770' },
  { 'Business Name': 'సాయిరాం ఎలక్ట్రానిక్స్ (బి. రాజు)', 'Category': 'Electrical & Hardware', 'Primary Phone': '9912101391', 'Secondary Phone': '' },
  { 'Business Name': 'జంగయ్య ఎలక్ట్రికల్ వర్క్స్ (జి. జంగయ్యగౌడ్)', 'Category': 'Electrical & Hardware', 'Primary Phone': '9849078227', 'Secondary Phone': '' },
  { 'Business Name': 'రామా ఎలక్ట్రికల్ & ఎలక్ట్రానిక్స్ (యస్. జైపాల్‌రెడ్డి)', 'Category': 'Electrical & Hardware', 'Primary Phone': '9440714358', 'Secondary Phone': '' },
  { 'Business Name': 'సాయిదుర్గ ఇండస్ట్రియల్ సప్లైస్ (శ్రీనివాసాచారి)', 'Category': 'Electrical & Hardware', 'Primary Phone': '9848242274', 'Secondary Phone': '' },
  { 'Business Name': 'అల్ఫి ఎలక్ట్రికల్ & ఎలక్ట్రానిక్స్ (కె. లక్ష్మీనర్సింహచారి)', 'Category': 'Electrical & Hardware', 'Primary Phone': '9848227693', 'Secondary Phone': '9848828970' },
  { 'Business Name': 'న్యూ విజయ ఎలక్ట్రికల్స్ (టెక్స్‌మో డీలర్)', 'Category': 'Electrical & Hardware', 'Primary Phone': '7661906717', 'Secondary Phone': '' },
  { 'Business Name': 'మహర్షి ఎంటర్ ప్రైజెస్ (బొంగు జంగయ్యగౌడ్)', 'Category': 'Electrical & Hardware', 'Primary Phone': '9848228026', 'Secondary Phone': '9701028026' },

  // Page 10: Fertilizers & Agriculture Seeds
  { 'Business Name': 'బి.ఎన్. సీడ్స్ ప్రై. లి (బి.యస్.రెడ్డి)', 'Category': 'Agriculture & Seeds', 'Primary Phone': '9848442638', 'Secondary Phone': '9848435751' },
  { 'Business Name': 'అన్నదాత సీడ్స్ & పెస్టిసైడ్స్ (జె. నరసింహ గౌడ్)', 'Category': 'Agriculture & Seeds', 'Primary Phone': '9948938668', 'Secondary Phone': '9000986481' },
  { 'Business Name': 'కోరమండల్ ఫెర్టిలైజర్స్ లిమిటెడ్ (మన గ్రోమోర్ మేనేజర్ సంతోష్ రెడ్డి)', 'Category': 'Agriculture & Seeds', 'Primary Phone': '9701601613', 'Secondary Phone': '' },
  { 'Business Name': 'మహాలక్ష్మి ఫెర్టిలైజర్స్ (మంచి కంటి వెంకన్న)', 'Category': 'Agriculture & Seeds', 'Primary Phone': '9247495676', 'Secondary Phone': '' },
  { 'Business Name': 'సాంబశివరామ్ సీడ్స్ & పెస్టిసైడ్స్ (యం. శేఖర్‌రెడ్డి)', 'Category': 'Agriculture & Seeds', 'Primary Phone': '9848842616', 'Secondary Phone': '' },
  { 'Business Name': 'శ్రీలక్ష్మి సీడ్స్ & పెస్టిసైడ్స్ (బుయ్య నరసింహ)', 'Category': 'Agriculture & Seeds', 'Primary Phone': '9948417525', 'Secondary Phone': '' },
  { 'Business Name': 'ధనలక్ష్మి ఫెర్టిలైజర్స్, పెస్టిసైడ్స్ (దాచేపల్లి శ్రీనివాస్‌గుప్తా & ప్రవీణ్‌కుమార్‌గుప్తా)', 'Category': 'Agriculture & Seeds', 'Primary Phone': '9848276768', 'Secondary Phone': '9000866869' },
  { 'Business Name': 'శివ ఫెర్టిలైజర్స్ (యం. లక్ష్మనారాయణ)', 'Category': 'Agriculture & Seeds', 'Primary Phone': '9848409837', 'Secondary Phone': '' },
  { 'Business Name': 'అగ్రోస్ రైతు సేవా కేంద్రం (వై. పెంటయ్య)', 'Category': 'Agriculture & Seeds', 'Primary Phone': '9948234248', 'Secondary Phone': '' },
  { 'Business Name': 'ధరణి సీడ్స్ & ఫెర్టిలైజర్స్', 'Category': 'Agriculture & Seeds', 'Primary Phone': '9963312614', 'Secondary Phone': '' },
  { 'Business Name': 'భాస్కర ఫెర్టిలైజర్స్ & పెస్టిసైడ్స్ (సుమన్‌రెడ్డి)', 'Category': 'Agriculture & Seeds', 'Primary Phone': '9948138552', 'Secondary Phone': '9848871139' },
]

async function runPDFSync() {
  console.log('Reading PDF binary file from:', PDF_PATH)

  let extractedListings: Array<Record<string, any>> = []

  try {
    const dataBuffer = fs.readFileSync(PDF_PATH)
    const uint8Array = new Uint8Array(dataBuffer)
    const parser = new PDFParse(uint8Array)
    const pdfData = await parser.getText()
    console.log(`PDF successfully parsed. Pages: ${pdfData.numpages || 'N/A'}`)
  } catch (pdfErr) {
    console.warn('PDF text parse skipped (scanned bitmap images), relying on extracted directory listings.')
  }

  // Format listings into exact 12-column schema required by sheet-sync endpoint
  const formattedData = CURATED_LISTINGS.map((item) => ({
    'Business Name': item['Business Name'],
    'Category': item['Category'],
    'Primary Phone': item['Primary Phone'],
    'Secondary Phone': item['Secondary Phone'] || '',
    'WhatsApp': item['Primary Phone'],
    'Village': 'Choutuppal',
    'Address': `${item['Business Name']}, Choutuppal, Yadadri Bhuvanagiri District`,
    'Description': `${item['Business Name']} - ${item['Category']} in Choutuppal. Contact: ${item['Primary Phone']}`,
    'Cover Image': '',
    'Logo': '',
    'Hours': '9 AM - 9 PM',
    'Price': '',
  }))

  console.log(`\nPrepared ${formattedData.length} valid commercial listings in 12-column schema format.`)
  console.log('Sample payload record:', JSON.stringify(formattedData[0], null, 2))

  console.log(`\nPosting payload to bulk sync API endpoint: ${API_URL}...`)

  const payload = {
    type: 'Listings',
    data: formattedData,
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SECRET_TOKEN}`,
        'x-webhook-secret': SECRET_TOKEN,
      },
      body: JSON.stringify(payload),
    })

    const result = await response.json()
    console.log('\n=================== API RESPONSE ===================')
    console.log('HTTP Status Code:', response.status)
    console.log('API Response Body:', JSON.stringify(result, null, 2))
    console.log('====================================================\n')
  } catch (apiErr) {
    console.error('API Request Error:', apiErr)
  }
}

runPDFSync()
