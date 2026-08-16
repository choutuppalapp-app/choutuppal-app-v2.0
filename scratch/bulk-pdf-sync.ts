import fs from 'fs'
import path from 'path'

// @ts-ignore
const { PDFParse } = require('pdf-parse')

const TARGET_DIR = process.env.PDF_DIR || 'C:\\Users\\Citizen2\\Desktop\\ChoutuppalPDFs'
const API_URL = process.env.SYNC_API_URL || 'https://www.choutuppal.in/api/webhooks/sheet-sync'
const SECRET_TOKEN = process.env.SHEET_SYNC_SECRET || 'sheet_sync_secret_choutuppal_2026'

// Non-commercial, government, political, emergency, bank filtering keywords
const EXCLUDE_KEYWORDS = [
  'ఉపాధ్యాయులు',
  'ఉపాధ్యాయ సంఘాల',
  'నాయకులు',
  'సర్పంచ్',
  'ఎంపీటీసీ',
  'జడ్పీటీసీ',
  'ఎమర్జెన్సీ',
  'పోలీస్',
  'ప్రభుత్వ',
  'గవర్నమెంట్',
  'రాజకీయ',
  'పార్టీ',
  'బ్యాంక్',
  'తహశీల్దార్',
  'కలెక్టర్',
  'Teacher',
  'Government',
  'Police',
  'Emergency',
  'Bank',
]

// Complete directory dataset mapped per split file
const FILE_LISTINGS_MAP: Record<string, Array<{ name: string; cat: string; phone: string; secPhone?: string }>> = {
  'CPL_Dir_2026-1.pdf': [
    { name: 'మారుతి ఆటో ఎలక్ట్రికల్ వర్క్స్ (చెరుకు అశోక్ గౌడ్)', cat: 'Automobile', phone: '9848768589' },
    { name: 'మణికంఠ ఆటో ఎలక్ట్రికల్ వర్క్స్ (రాము)', cat: 'Automobile', phone: '9948485484' },
    { name: 'S.S. ఆటో ఎలక్ట్రికల్ వర్క్స్', cat: 'Automobile', phone: '9885374861' },
    { name: 'సాగర్ ఆటో ఎలక్ట్రికల్ వర్క్స్', cat: 'Automobile', phone: '9348914632' },
    { name: 'మల్లిఖార్జున ఆటో ఎలక్ట్రికల్ వర్క్స్', cat: 'Automobile', phone: '9848325187' },
    { name: 'నేషనల్ ఆటో ఎలక్ట్రికల్ వర్క్స్', cat: 'Automobile', phone: '9866073224', secPhone: '9848875260' },
    { name: 'లింగస్వామి ఆటో అండ్ ఆటో మెకానిక్ వర్క్స్', cat: 'Automobile', phone: '9912567621' },
    { name: 'శ్రీ అయ్యప్ప ఆటో ఎలక్ట్రికల్ వర్క్స్ (చెరుకు లింగస్వామి గౌడ్)', cat: 'Automobile', phone: '9666346344' },
    { name: 'ఆటో వర్క్స్ (బొడిగె వెంకటేష్)', cat: 'Automobile', phone: '9010838151' },
    { name: 'రెడ్డి బైక్ ఎలక్ట్రికల్ వర్క్స్', cat: 'Automobile', phone: '9030939896' },
    { name: 'హరిచరణ్ ఆటో ఎలక్ట్రికల్ వర్క్స్ (మడుగని ప్రవీణ్ గౌడ్)', cat: 'Automobile', phone: '9393631656', secPhone: '9963179381' },
    { name: 'ఎస్. ఎం. ఆటో ఎలక్ట్రికల్ వర్క్స్ (యం. మతీన్)', cat: 'Automobile', phone: '8008774663' },
    { name: 'శ్రీ లక్ష్మీ నరసింహ ఆటో ఎలక్ట్రికల్ వర్క్స్', cat: 'Automobile', phone: '8309316793', secPhone: '9951906366' },
    { name: 'స్టార్ ఆటో ఎలక్ట్రికల్ వర్క్స్ (సయ్యద్ ఆమెర్)', cat: 'Automobile', phone: '8309396117' },
    { name: 'విజయ్ ఆటో మెకానిక్ వర్క్స్', cat: 'Automobile', phone: '9848850776' },
    { name: 'యస్.వి. ఆటో ఎలక్ట్రికల్ వర్క్స్', cat: 'Automobile', phone: '9912595059' },
    { name: 'సాయిరాం ఆటో మెకానిక్ వర్క్స్', cat: 'Automobile', phone: '9848563292', secPhone: '9912665838' },
    { name: 'హనుమాన్ ఆటో మెకానిక్ వర్క్స్ (పద్మాగౌడ్)', cat: 'Automobile', phone: '9948225446', secPhone: '8099432311' },
  ],
  'CPL_Dir_2026-2.pdf': [
    { name: 'రమేష్ ఆటో మెకానిక్ వర్క్స్', cat: 'Automobile', phone: '9908710508' },
    { name: 'సిద్ధార్థ ఆటో మెకానిక్ వర్క్స్', cat: 'Automobile', phone: '9505573462' },
    { name: 'సాయి ఆటో మెకానిక్ వర్క్స్ (జై. రాజేశ్వర్ రెడ్డి)', cat: 'Automobile', phone: '9951255481' },
    { name: 'అయ్యప్ప ఆటోమోబైల్ & వర్క్స్ షాప్ (చిడుగుళ్ల లింగస్వామి)', cat: 'Automobile', phone: '9010879649', secPhone: '9381357377' },
    { name: 'ఇంజనీర్స్ ఇన్‌ఫ్రాటెక్ (పబ్బు సాయికుమార్)', cat: 'Interior & Decor', phone: '9010220245', secPhone: '9848520331' },
    { name: 'వి.ఎస్.ఎం.ఎల్ ప్లానింగ్ & కన్స్ట్రక్షన్ (వరగంటి మహేందర్)', cat: 'Interior & Decor', phone: '9505550363' },
    { name: 'సూర్య సివిల్ డిజైన్స్ కాంట్రాక్టర్స్ & ఇంటీరియర్ డిజైనింగ్', cat: 'Interior & Decor', phone: '9640047092', secPhone: '9618679443' },
    { name: 'ఇన్ఫ్రాస్ట్రక్చర్ & డెవలపర్స్', cat: 'Interior & Decor', phone: '9985599665', secPhone: '9381399416' },
    { name: 'రాఘవేంద్ర ప్లానింగ్ కన్స్ట్రక్షన్', cat: 'Interior & Decor', phone: '9912625347', secPhone: '9381386875' },
    { name: 'ప్రదీప్ ఇంటీరియర్ డిజైనింగ్ (రఘువర్ధన్ రెడ్డి)', cat: 'Interior & Decor', phone: '9966025089', secPhone: '6301360418' },
    { name: 'యం.యస్. ఇంటీరియర్స్ హోమ్ డెకోరేషన్', cat: 'Interior & Decor', phone: '9705142002', secPhone: '9533163313' },
    { name: 'శ్రీ లక్ష్మీ నర్సింహస్వామి ఇంటీరియర్స్', cat: 'Interior & Decor', phone: '9701453579', secPhone: '8919170108' },
    { name: 'అను ఇంటీరియర్ డెకోరేటర్స్ (గ్యార శేఖర్)', cat: 'Interior & Decor', phone: '7661044133' },
    { name: 'యస్. యస్. ఎంటర్ ప్రైజెస్ (ఇంటీరియర్ ప్రొడక్ట్స్)', cat: 'Interior & Decor', phone: '7842227538', secPhone: '7842227541' },
  ],
  'CPL_Dir_2026-3.pdf': [
    { name: 'రాజేష్ ఇంటర్నెట్ సెంటర్ (ఈ-సేవ)', cat: 'Internet & Cyber Cafe', phone: '9948489462' },
    { name: 'టి. ఎన్. ఆన్‌లైన్ సర్వీసెస్ (సందల రాజేష్ కుమార్)', cat: 'Internet & Cyber Cafe', phone: '9912654777', secPhone: '9052813456' },
    { name: 'టి - సేవ', cat: 'Internet & Cyber Cafe', phone: '9666108908', secPhone: '9912273382' },
    { name: 'శ్రీనేత్ వరల్డ్ ఇంటర్నెట్ (యం. శేఖర్‌గౌడ్)', cat: 'Internet & Cyber Cafe', phone: '9912080812' },
    { name: 'సురేష్ ఇంటర్నెట్ వరల్డ్ (నరేష్‌గౌడ్)', cat: 'Internet & Cyber Cafe', phone: '9618779089' },
    { name: 'రెయిన్‌బో ఇంటర్నెట్ (బి. శ్రీను)', cat: 'Internet & Cyber Cafe', phone: '7702348845' },
    { name: 'గ్లోబల్ ఇ-సేవా', cat: 'Internet & Cyber Cafe', phone: '9948770651' },
    { name: 'చరణ్ ఇంటర్నెట్ సెంటర్ (గంజి కృష్ణ)', cat: 'Internet & Cyber Cafe', phone: '9246334470' },
    { name: 'బ్రైట్ సొల్యూషన్స్', cat: 'Internet & Cyber Cafe', phone: '9666281743', secPhone: '9912135142' },
    { name: 'స్పీడ్ ఇంటర్నెట్ (వెంకటేష్)', cat: 'Internet & Cyber Cafe', phone: '9666456767', secPhone: '8096479017' },
    { name: 'జకాత్ ఇంటర్నెట్ వరల్డ్ (సి.హెచ్. రాఘవేంద్రాచారి)', cat: 'Internet & Cyber Cafe', phone: '9912761434' },
    { name: 'సాన్వి ఇంటర్నెట్ (గంజి రాఘవ)', cat: 'Internet & Cyber Cafe', phone: '9959894827', secPhone: '9292004357' },
    { name: 'మీ సేవా (చెర్కు భాస్కర్)', cat: 'Internet & Cyber Cafe', phone: '9553591601' },
    { name: 'TJN సాఫ్ట్ సొల్యూషన్స్', cat: 'Internet & Cyber Cafe', phone: '9848606666', secPhone: '8185991919' },
    { name: 'సైబర్ నెట్ జోన్ (సి.హెచ్. భాస్కర్)', cat: 'Internet & Cyber Cafe', phone: '9553591601' },
    { name: 'లక్ష్మీ నెట్ జోన్ (నెల్లూరి రాజు)', cat: 'Internet & Cyber Cafe', phone: '9550606050' },
    { name: 'వాణి నెట్ వరల్డ్', cat: 'Internet & Cyber Cafe', phone: '9014692282' },
    { name: 'రుషిక ఇంటర్నెట్', cat: 'Internet & Cyber Cafe', phone: '8121378378' },
    { name: 'సృజన నెట్‌వర్క్', cat: 'Internet & Cyber Cafe', phone: '9550999089' },
    { name: 'రాయల్ నెట్‌వర్క్', cat: 'Internet & Cyber Cafe', phone: '9010222101' },
    { name: 'శివ జిరాక్స్ & ఇంటర్నెట్ (యం. గోపాల్)', cat: 'Internet & Cyber Cafe', phone: '7893450363' },
    { name: 'యువ నేత వరల్డ్', cat: 'Internet & Cyber Cafe', phone: '9542724488' },
    { name: 'యాదాద్రి నెట్', cat: 'Internet & Cyber Cafe', phone: '8121378378' },
    { name: 'మణికంఠ ఇంటర్నెట్ & జిరాక్స్', cat: 'Internet & Cyber Cafe', phone: '7660959566' },
    { name: 'శివ నెట్ వరల్డ్', cat: 'Internet & Cyber Cafe', phone: '9852189325' },
    { name: 'సాయిరాం ఇంటర్నెట్ (శ్రీకాంత్)', cat: 'Internet & Cyber Cafe', phone: '9502461005' },
    { name: 'శ్రీ లక్ష్మి ఇంటర్నెట్ & జిరాక్స్', cat: 'Internet & Cyber Cafe', phone: '9912972737', secPhone: '6281367543' },
    { name: 'వి.హెచ్. ఇంటర్నెట్ & మనీ ట్రాన్స్‌ఫర్', cat: 'Internet & Cyber Cafe', phone: '9951957357', secPhone: '7780588300' },
    { name: 'మణికంఠ ఇంటర్నెట్ & మనీ ట్రాన్స్‌ఫర్', cat: 'Internet & Cyber Cafe', phone: '8106492218' },
    { name: 'నవభారతి సిమెంట్ ప్రొడక్ట్స్ (వి. సత్యనారాయణ / కె. లింగస్వామి)', cat: 'Building Materials', phone: '9951114406', secPhone: '9542376858' },
    { name: 'CSR ట్రేడర్స్ (సి.హెచ్. రవీందర్)', cat: 'Building Materials', phone: '9848363847', secPhone: '9700206211' },
    { name: 'వరలక్ష్మి హలో బ్రిక్స్ (ఐలు అంచయ్యగౌడ్)', cat: 'Building Materials', phone: '9848178482' },
    { name: 'శ్రీసాయి కృష్ణ సిమెంట్ బ్రిక్స్ (వి. ఇంద్రపాల్‌రెడ్డి)', cat: 'Building Materials', phone: '9848455987' },
    { name: 'పి. మారయ్య సిమెంట్ వర్క్స్', cat: 'Building Materials', phone: '9848508649' },
    { name: 'అరుణ బ్రిక్స్ ఇండస్ట్రీస్', cat: 'Building Materials', phone: '9849379305' },
    { name: 'శ్రీ బాలాజీ బ్రిక్స్ (కె. వెంకటేష్)', cat: 'Building Materials', phone: '9848923365' },
    { name: 'ఎస్.ఎం.ఎస్. సిమెంట్ బ్రిక్స్ (బి. గణేష్, పి. శేఖర్‌రెడ్డి)', cat: 'Building Materials', phone: '9848774941', secPhone: '9912091891' },
    { name: 'శివసాయి సిమెంట్ బ్రిక్స్ (బోగిరి కృష్ణగౌడ్)', cat: 'Building Materials', phone: '9949853865', secPhone: '9866214483' },
    { name: 'ఎస్.ఎస్.ఎన్. వాల్ ప్రొడక్ట్స్', cat: 'Building Materials', phone: '9550850501', secPhone: '9440567009' },
    { name: 'మహాలక్ష్మి సిమెంట్ బ్రిక్స్ (బొంగు ప్రవీణ్‌గౌడ్)', cat: 'Building Materials', phone: '9550545362' },
    { name: 'శ్రీలక్ష్మి ప్రీ కాస్ట్ ప్రొడక్ట్స్', cat: 'Building Materials', phone: '9666680871', secPhone: '7989316021' },
  ],
  'CPL_Dir_2026-4.pdf': [
    { name: 'రవి రోలింగ్ షట్టర్స్ (చారి)', cat: 'Engineering & Welding', phone: '9912422120' },
    { name: 'స్టార్ ఇంజనీరింగ్ వర్క్స్ (యం.డి మదార్)', cat: 'Engineering & Welding', phone: '9948261667' },
    { name: 'అయ్యప్ప ఇంజనీరింగ్ వర్క్స్ (మలిగి శ్రీను)', cat: 'Engineering & Welding', phone: '9848419203' },
    { name: 'సిరి ఇంజనీరింగ్ వర్క్స్ & రీ బోరింగ్', cat: 'Engineering & Welding', phone: '9948184391' },
    { name: 'తాజుద్దీన్ వెల్డింగ్ వర్క్స్ (బడేభాయి)', cat: 'Engineering & Welding', phone: '9848612988', secPhone: '9701686058' },
    { name: 'న్యూ తాజుద్దీన్ వెల్డింగ్ వర్క్స్', cat: 'Engineering & Welding', phone: '9948809577', secPhone: '8106703028' },
    { name: 'శ్రీనివాస ఇంజనీరింగ్ వర్క్స్', cat: 'Engineering & Welding', phone: '9948630095' },
    { name: 'మురళీకృష్ణ ఇంజనీరింగ్ వర్క్స్ (బి. భూపాలాచారి)', cat: 'Engineering & Welding', phone: '9848011533', secPhone: '9494443567' },
    { name: 'సాయి ఇంజనీరింగ్ వర్క్స్ (జి. జంగయ్యచారి)', cat: 'Engineering & Welding', phone: '9848836847' },
    { name: 'లతీఫ్ ఇంజనీరింగ్ వర్క్స్', cat: 'Engineering & Welding', phone: '9912435548', secPhone: '9059993888' },
    { name: 'జాన్ ఇంజనీరింగ్ వర్క్స్', cat: 'Engineering & Welding', phone: '9951021871' },
    { name: 'రహీమ్ వెల్డింగ్ వర్క్స్', cat: 'Engineering & Welding', phone: '9640201084' },
    { name: 'లక్ష్మీనరసింహ ఎలక్ట్రికల్ & ఇంజనీరింగ్ వర్క్స్', cat: 'Engineering & Welding', phone: '9848873214', secPhone: '9912457209' },
    { name: 'ఆంజనేయాచారి ఇంజనీరింగ్ వర్క్స్', cat: 'Engineering & Welding', phone: '9912665903' },
    { name: 'జమీర్ ఇంజనీరింగ్ వర్క్స్', cat: 'Engineering & Welding', phone: '9948408202' },
    { name: 'ఎస్ఎం ఇంజనీరింగ్ వర్క్స్', cat: 'Engineering & Welding', phone: '9502368505' },
    { name: 'కృపా ఇంజనీరింగ్ వర్క్స్', cat: 'Engineering & Welding', phone: '9848266323' },
    { name: 'మదీనా వెల్డింగ్ వర్క్స్ (యం.డి. జమీద్)', cat: 'Engineering & Welding', phone: '9640174201' },
    { name: 'శ్రీసాయి ఇంజనీరింగ్ వర్క్స్ (బి. శ్రీనివాస్)', cat: 'Engineering & Welding', phone: '9848526706' },
    { name: 'తిరుమల ఎలక్ట్రికల్ వర్క్స్ (అంజిరెడ్డి)', cat: 'Engineering & Welding', phone: '9440761815' },
    { name: 'రూమి ఇంజనీరింగ్ వర్క్స్ (యస్.కె. లియాఖత్)', cat: 'Engineering & Welding', phone: '9848927017' },
    { name: 'రెడ్డి ఇంజనీరింగ్ వర్క్స్', cat: 'Engineering & Welding', phone: '9848592424' },
    { name: 'హైమత్ వెల్డింగ్ వర్క్స్', cat: 'Engineering & Welding', phone: '8498880142' },
    { name: 'యం.ఆర్. ఇంజనీరింగ్ వర్క్స్', cat: 'Engineering & Welding', phone: '9949034297', secPhone: '9640718505' },
    { name: 'యం.డి అబ్దుల్లా వెల్డింగ్ వర్క్స్', cat: 'Engineering & Welding', phone: '9948909577' },
    { name: 'సన ఇంజనీరింగ్ వర్క్స్', cat: 'Engineering & Welding', phone: '9494853704' },
    { name: 'బిస్మిల్లా ఇంజనీరింగ్ వర్క్స్', cat: 'Engineering & Welding', phone: '8374691172' },
    { name: 'రేణుకా ఇంజనీరింగ్ వర్క్స్ (పులిగిళ్ల బ్రహ్మాచారి)', cat: 'Engineering & Welding', phone: '9866361431' },
    { name: 'బ్రహ్మాచారి ఇంజనీరింగ్ వర్క్స్ (చెన్నోజు బ్రహ్మాచారి)', cat: 'Engineering & Welding', phone: '9912665823' },
    { name: 'శ్రీ వేంకటేశ్వర ఇంజనీరింగ్ వర్క్స్ (లక్ష్మణ్)', cat: 'Engineering & Welding', phone: '9573453174', secPhone: '7569383300' },
    { name: 'శ్రీ మల్లిఖార్జున ఇంజనీరింగ్ వర్క్స్', cat: 'Engineering & Welding', phone: '9912972793' },
  ],
  'CPL_Dir_2026-5.pdf': [
    { name: 'సాయిరాం ఇంజనీరింగ్ వర్క్స్ (ఉప్పు ఆంజనేయులు)', cat: 'Engineering & Welding', phone: '9441079555', secPhone: '9498933665' },
    { name: 'భారత్ ఇంజనీరింగ్ వర్క్స్ (యం.డి దిల్‌వార్‌ఖాన్)', cat: 'Engineering & Welding', phone: '9948322930' },
    { name: 'ఖాన్ వెల్డింగ్ వర్క్స్ & రేడియేటర్ వర్క్స్', cat: 'Engineering & Welding', phone: '9848322141' },
    { name: 'మహాదేవ్ ఇంజనీరింగ్ వర్క్స్ (దాసురోజు ఉపేంద్రాచారి)', cat: 'Engineering & Welding', phone: '9912139210' },
    { name: 'నర్సింహ్మ ఇంజనీరింగ్ వర్క్స్ (బెజ్జ నర్సింహ్మ)', cat: 'Engineering & Welding', phone: '9848740000' },
    { name: 'అనిత ఇంజనీర్స్ (జి. అశోక్)', cat: 'Interior & Decor', phone: '9515444271', secPhone: '9573318322' },
    { name: 'శ్రీ వేంకటేశ్వర వాటర్ ప్రూఫ్ సొల్యూషన్', cat: 'Interior & Decor', phone: '9010003382', secPhone: '7989060910' },
    { name: 'ఓం సాయిరాం వాటర్ సొల్యూషన్స్ (బొల్లా భాస్కర్)', cat: 'Interior & Decor', phone: '9701525223', secPhone: '9553558110' },
    { name: 'ఎన్.వి. ప్రొడెక్ట్స్ అడ్వాన్స్ వాటర్ ప్రూఫింగ్', cat: 'Interior & Decor', phone: '8328316035', secPhone: '9908395826' },
  ],
  'CPL_Dir_2026-6.pdf': [
    { name: 'విశ్వతేజ ఫర్నీచర్స్ (దేవరకొండ నర్సింహాచారి)', cat: 'Furniture & Home', phone: '8712904415', secPhone: '9912759414' },
    { name: 'ఓంకార్ ఫర్నీచర్ వర్క్స్ (యం. ధనుంజయాచారి)', cat: 'Furniture & Home', phone: '9985006274' },
    { name: 'శివ ఉడెన్ వర్క్స్ (యం. భిక్షమాచారి)', cat: 'Furniture & Home', phone: '9912669088' },
    { name: 'శ్రీనివాసా ఉడెన్ వర్క్స్ (పి. మల్లయాచారి)', cat: 'Furniture & Home', phone: '9949034281' },
    { name: 'యం. సుభాష్ ఉడెన్ ఫర్నీచర్ వర్క్స్', cat: 'Furniture & Home', phone: '9848563570' },
    { name: 'విజయలక్ష్మి ఉడ్ & అల్యూమినియం వర్క్స్ (నగేశ్)', cat: 'Furniture & Home', phone: '9848660503' },
    { name: 'నైస్ ఉడ్ కార్వింగ్ హ్యాండి క్రాఫ్ట్స్', cat: 'Furniture & Home', phone: '9912354391' },
    { name: 'రాజు ఉడెన్ ఫర్నీచర్ వర్క్స్ (రాజాచారి)', cat: 'Furniture & Home', phone: '9948903896' },
    { name: 'శ్రీఆంజనేయ ఉడెన్‌ఫర్నీచర్ వర్క్స్ (ఎ. యాదయ్య)', cat: 'Furniture & Home', phone: '9848665237', secPhone: '9032665853' },
    { name: 'దివ్యశ్రీ ఉడెన్ వర్క్స్ (పి. మధుసూధనాచారి)', cat: 'Furniture & Home', phone: '9912191201' },
    { name: 'భవాని ఫర్నీచర్ వర్క్స్ (బోడుల భిక్షపతి)', cat: 'Furniture & Home', phone: '9912665941' },
    { name: 'తిరుమల ఉడెన్ ఫర్నీచర్ వర్క్స్ (పి. బ్రహ్మాచారి)', cat: 'Furniture & Home', phone: '9908317166' },
    { name: 'లక్ష్మీప్రసన్న ఉడెన్ ఫర్నీచర్ వర్క్స్ (పి. నాగేష్)', cat: 'Furniture & Home', phone: '9848991318' },
    { name: 'నవీన్ వుడ్ కార్వింగ్ వర్క్స్ (ఎస్. నవీన్చారి)', cat: 'Furniture & Home', phone: '9177675777' },
  ],
  'CPL_Dir_2026-7.pdf': [
    { name: 'ధనలక్ష్మి ఏజెన్సీ (విజయ వంట నూనెలు)', cat: 'Agencies & Distributors', phone: '9848112630' },
    { name: 'శ్రీ వేంకటేశ్వర ఎంటర్ ప్రైజెస్ (గార్లపాటి శ్రీనివాస్)', cat: 'Agencies & Distributors', phone: '9848560372', secPhone: '9948085251' },
    { name: 'శ్రీ లక్ష్మి ఏజెన్సీస్ (వి. సూర్యనారాయణ)', cat: 'Agencies & Distributors', phone: '9248036645' },
    { name: 'జి.వి.ఆర్. ఏజెన్సీస్ (గట్టు వీరేశం)', cat: 'Agencies & Distributors', phone: '8499870219' },
    { name: 'శివసాయి ట్రేడర్స్ (కూల్ డ్రింక్స్) (సుర్పంగి శేఖర్‌రెడ్డి)', cat: 'Agencies & Distributors', phone: '7981438858' },
    { name: 'స్నేహా గ్యాస్ ఏజెన్సీస్ (మహ్మద్ హబీబి)', cat: 'Agencies & Distributors', phone: '9948161786', secPhone: '9848707122' },
  ],
  'CPL_Dir_2026-8.pdf': [
    { name: 'విజయలక్ష్మి ఉడెన్ & స్టీల్ ఫర్నీచర్', cat: 'Furniture & Home', phone: '9848834842' },
    { name: 'సత్యదుర్గ స్టీల్ & ఫర్నీచర్ వర్క్స్ (ఎన్. బాల్‌రాజు)', cat: 'Furniture & Home', phone: '9848285568', secPhone: '9951660568' },
    { name: 'శ్రీ బాలాజీ స్టీల్ & ఫర్నీచర్ వర్క్స్ (టి. దామోదర్)', cat: 'Furniture & Home', phone: '9848706659' },
    { name: 'శ్రీ శ్రీనివాస స్టీల్, ఫర్నీచర్ వర్క్స్ (వి. జంగయ్యగౌడ్)', cat: 'Furniture & Home', phone: '9948108923' },
    { name: 'కొయ్యడ వెంకటేష్ గౌడ్ (ఎలక్ట్రీషియన్)', cat: 'Electrical & Hardware', phone: '9848927143', secPhone: '9032850143' },
    { name: 'ఎలమోని వెంకటేష్ (ఎలక్ట్రీషియన్)', cat: 'Electrical & Hardware', phone: '9542081177' },
    { name: 'సమీర్ ఎలక్ట్రికల్స్ (యం.ఎ. నయీమ్)', cat: 'Electrical & Hardware', phone: '9948458557' },
    { name: 'శ్రీరాఘవేంద్ర ఎలక్ట్రానిక్స్ (డి. వెంకటేష్)', cat: 'Electrical & Hardware', phone: '9849294931', secPhone: '9948632849' },
    { name: 'వినాయక మోటార్ వైండింగ్ వర్క్స్ (కృష్ణా రెడ్డి)', cat: 'Electrical & Hardware', phone: '9948485475' },
    { name: 'శ్రీ రాజరాజేశ్వరీ ఎలక్ట్రికల్ వర్క్స్ (కె. రవిచారి)', cat: 'Electrical & Hardware', phone: '9912669050', secPhone: '9010005803' },
  ],
  'CPL_Dir_2026-9.pdf': [
    { name: 'లక్ష్మి సాయి ఇంజనీరింగ్ వర్క్స్', cat: 'Electrical & Hardware', phone: '9912640534', secPhone: '9848228770' },
    { name: 'సాయిరాం ఎలక్ట్రానిక్స్ (బి. రాజు)', cat: 'Electrical & Hardware', phone: '9912101391' },
    { name: 'జంగయ్య ఎలక్ట్రికల్ వర్క్స్ (జి. జంగయ్యగౌడ్)', cat: 'Electrical & Hardware', phone: '9849078227' },
    { name: 'రామా ఎలక్ట్రికల్ & ఎలక్ట్రానిక్స్ (యస్. జైపాల్‌రెడ్డి)', cat: 'Electrical & Hardware', phone: '9440714358' },
    { name: 'సాయిదుర్గ ఇండస్ట్రియల్ సప్లైస్ (శ్రీనివాసాచారి)', cat: 'Electrical & Hardware', phone: '9848242274' },
    { name: 'అల్ఫి ఎలక్ట్రికల్ & ఎలక్ట్రానిక్స్ (కె. లక్ష్మీనర్సింహచారి)', cat: 'Electrical & Hardware', phone: '9848227693', secPhone: '9848828970' },
    { name: 'న్యూ విజయ ఎలక్ట్రికల్స్ (టెక్స్‌మో డీలర్)', cat: 'Electrical & Hardware', phone: '7661906717' },
    { name: 'మహర్షి ఎంటర్ ప్రైజెస్ (బొంగు జంగయ్యగౌడ్)', cat: 'Electrical & Hardware', phone: '9848228026', secPhone: '9701028026' },
  ],
  'CPL_Dir_2026-10.pdf': [
    { name: 'బి.ఎన్. సీడ్స్ ప్రై. లి (బి.యస్.రెడ్డి)', cat: 'Agriculture & Seeds', phone: '9848442638', secPhone: '9848435751' },
    { name: 'అన్నదాత సీడ్స్ & పెస్టిసైడ్స్ (జె. నరసింహ గౌడ్)', cat: 'Agriculture & Seeds', phone: '9948938668', secPhone: '9000986481' },
    { name: 'కోరమండల్ ఫెర్టిలైజర్స్ లిమిటెడ్ (సంతోష్ రెడ్డి)', cat: 'Agriculture & Seeds', phone: '9701601613' },
    { name: 'మహాలక్ష్మి ఫెర్టిలైజర్స్ (మంచి కంటి వెంకన్న)', cat: 'Agriculture & Seeds', phone: '9247495676' },
    { name: 'సాంబశివరామ్ సీడ్స్ & పెస్టిసైడ్స్ (యం. శేఖర్‌రెడ్డి)', cat: 'Agriculture & Seeds', phone: '9848842616' },
    { name: 'శ్రీలక్ష్మి సీడ్స్ & పెస్టిసైడ్స్ (బుయ్య నరసింహ)', cat: 'Agriculture & Seeds', phone: '9948417525' },
    { name: 'ధనలక్ష్మి ఫెర్టిలైజర్స్, పెస్టిసైడ్స్ (దాచేపల్లి శ్రీనివాస్‌గుప్తా)', cat: 'Agriculture & Seeds', phone: '9848276768', secPhone: '9000866869' },
    { name: 'శివ ఫెర్టిలైజర్స్ (యం. లక్ష్మనారాయణ)', cat: 'Agriculture & Seeds', phone: '9848409837' },
    { name: 'అగ్రోస్ రైతు సేవా కేంద్రం (వై. పెంటయ్య)', cat: 'Agriculture & Seeds', phone: '9948234248' },
    { name: 'ధరణి సీడ్స్ & ఫెర్టిలైజర్స్', cat: 'Agriculture & Seeds', phone: '9963312614' },
    { name: 'భాస్కర ఫెర్టిలైజర్స్ & పెస్టిసైడ్స్ (సుమన్‌రెడ్డి)', cat: 'Agriculture & Seeds', phone: '9948138552', secPhone: '9848871139' },
  ],
  'CPL_Dir_2026-11.pdf': [
    { name: 'శ్రీ వెంకటేశ్వర బ్యాటరీస్ (ఉప్పల నరేష్)', cat: 'Electrical & Hardware', phone: '9948485483', secPhone: '9030815463' },
    { name: 'శ్రీరామా గ్రానైట్స్ & టైల్స్ (లింగస్వామి యాదవ్)', cat: 'Building Materials', phone: '9912578497' },
    { name: 'భారత్ బజార్ (మహ్మద్ అజ్గర్ ఖాన్)', cat: 'Retail & Fashion', phone: '9948647472' },
    { name: 'ఆరోమా కిచెన్ ఫ్యామిలీ రెస్టారెంట్', cat: 'Food & Dining', phone: '9492143100' },
  ],
  'CPL_Dir_2026-12.pdf': [
    { name: 'శ్రీ కనకదుర్గ బైక్ బజార్ (వలందాసు సతీష్ గౌడ్)', cat: 'Automobile', phone: '9912640673' },
    { name: 'శ్రీ లక్ష్మీ గణపతి రెస్టారెంట్ & బార్', cat: 'Food & Dining', phone: '9989765666', secPhone: '9391900240' },
    { name: 'శ్రీరామ ట్రేడర్స్ (ఎలక్ట్రికల్, పెయింట్స్, ప్లంబింగ్)', cat: 'Electrical & Hardware', phone: '6303991635' },
  ],
  'CPL_Dir_2026-13.pdf': [
    { name: 'శ్రీ చంద్ర టెంట్ హౌజ్ & ఈవెంట్స్ (పొడిశెట్టి గణేష్)', cat: 'Furniture & Home', phone: '9848730946' },
    { name: 'శ్రీ చంద్ర మేకోవర్ ఆర్టిస్ట్ & బ్యూటీ పార్లర్ (డి. స్వాతి)', cat: 'Retail & Fashion', phone: '6281298982', secPhone: '9848730946' },
    { name: 'AMT ఇండస్ట్రీస్ (బి. మురళీకృష్ణ & బి. వంశీకృష్ణ)', cat: 'Engineering & Welding', phone: '9100280082', secPhone: '9908130813' },
  ],
  'CPL_Dir_2026-14.pdf': [
    { name: 'RGB గ్రాఫిక్స్ & ఫ్లెక్స్ బ్యానర్స్ (రఘు గౌడ్)', cat: 'Services', phone: '9553905779' },
    { name: 'దేవి గ్రాఫిక్స్ (సూర్వి శంకర్ గౌడ్ & కిషోర్ గౌడ్)', cat: 'Services', phone: '9912640613', secPhone: '8790121621' },
  ],
  'CPL_Dir_2026-15.pdf': [
    { name: 'సాయి స్ఫూర్తి మోటార్స్ (పోలేపల్లి నవీన్ & సుర్పంటి శేఖర్ రెడ్డి)', cat: 'Automobile', phone: '9553727705', secPhone: '7981438858' },
    { name: 'A1 క్యాటరింగ్ (చెక్కి ప్రవీణ్ కుమార్)', cat: 'Food & Dining', phone: '9110383477', secPhone: '9505103009' },
    { name: 'స్టార్ ఫిష్ వరల్డ్ & A1 కిచెన్ ఇక్విప్మెంట్స్', cat: 'Food & Dining', phone: '9505103009', secPhone: '9110383477' },
  ],
  'CPL_Dir_2026-16.pdf': [
    { name: 'శ్రీ లక్ష్మీ గణపతి బిల్డింగ్ మెటీరియల్ సప్లయర్స్ (అరిగె శేఖర్)', cat: 'Building Materials', phone: '9912138904', secPhone: '8125323589' },
    { name: 'శ్రీనివాస డ్రై ఫ్రూట్స్', cat: 'Food & Dining', phone: '9397171789' },
    { name: 'సాయి హెర్బల్ & నేచురల్ ప్రొడక్ట్స్ (కాసూరి రాంబాబు)', cat: 'Health & Medical', phone: '7013550117', secPhone: '9059664994' },
    { name: 'శ్రీ పున్నభావనారుషి మెగా షాపింగ్ మాల్', cat: 'Retail & Fashion', phone: '7675046164', secPhone: '9246877707' },
  ],
  'CPL_Dir_2026-17.pdf': [
    { name: 'న్యూటన్ ఫిజియోథెరపి క్లినిక్ (డా. గుండెబోయిన రమేష్ యాదవ్)', cat: 'Health & Medical', phone: '9963774545' },
    { name: 'భాగ్యశ్రీ హాస్పిటల్ & కంప్యూటర్ కంటి వైద్యశాల (డా. వి. నరసింహ వేముల)', cat: 'Health & Medical', phone: '9848732428' },
    { name: 'అందరికి ఆయుర్వేదం (వి.ఎన్. చౌదరి)', cat: 'Health & Medical', phone: '9290169419', secPhone: '9666003278' },
  ],
  'CPL_Dir_2026-18.pdf': [
    { name: 'S.M. ఎలక్ట్రానిక్స్ & హోమ్ నీడ్స్ (కొల్లూరి మహేష్)', cat: 'Electrical & Hardware', phone: '9866313215' },
    { name: 'ఎవర్‌గ్రీన్ సొల్యూషన్స్ CCTV సెక్యూరిటీ కెమెరాಸ್', cat: 'Electrical & Hardware', phone: '9666365552', secPhone: '9885341002' },
    { name: 'నందిని మార్కెటింగ్ ఏజెన్సీస్ (పెద్ది పాండు)', cat: 'Agencies & Distributors', phone: '9885676198', secPhone: '9032036195' },
    { name: 'శ్రీ లక్ష్మీ సామిల్ (పి. బాలలింగం)', cat: 'Furniture & Home', phone: '9848069503', secPhone: '8125987476' },
    { name: 'శ్రీ లక్ష్మీ నర్సింహ స్వామి రియల్ ఎస్టేట్స్ (పోలేపల్లి నవీన్)', cat: 'Real Estate', phone: '9553727705', secPhone: '7981438858' },
  ],
  'CPL_Dir_2026-19.pdf': [
    { name: 'ఎల్లప్ప హోటల్ & లాడ్జ్ (గట్టు ఎల్లప్ప)', cat: 'Food & Dining', phone: '9848961434', secPhone: '9948811143' },
    { name: 'సాయి సిద్ధార్థ డెంటల్ హాస్పిటల్ (డా. కె. రాజు చారి)', cat: 'Health & Medical', phone: '9848011533' },
    { name: 'కర్నాటి శ్రీనివాసులు టాక్స్ కన్సల్టెంట్', cat: 'Services', phone: '9440102093', secPhone: '9951203695' },
    { name: 'వాణి రైస్ డిపో & కిరాణం జనరల్ స్టోర్స్ (గార్లపాటి నర్సింహారెడ్డి)', cat: 'Food & Dining', phone: '9010326209' },
    { name: 'సిద్ధి వినాయక ఎంటర్ ప్రైజెస్ GST టాక్స్ కన్సల్టెంట్ (కందగట్ల వెంకటేష్)', cat: 'Services', phone: '9959360255', secPhone: '9908345100' },
  ],
}

async function sendChunkToAPI(chunk: Array<Record<string, any>>): Promise<boolean> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SECRET_TOKEN}`,
        'x-webhook-secret': SECRET_TOKEN,
      },
      body: JSON.stringify({
        type: 'Listings',
        data: chunk,
      }),
    })

    const resJson = await response.json()
    return response.ok && (resJson.ok || resJson.success)
  } catch (err) {
    console.error('  API Chunk Sync Error:', err)
    return false
  }
}

async function processBulkPDFs() {
  console.log('=== SEQUENTIAL BULK PDF TO API SYNC FOR MULTIPLE FILES ===')
  console.log('Target Directory:', TARGET_DIR)
  console.log('API Endpoint:', API_URL)

  if (!fs.existsSync(TARGET_DIR)) {
    console.error('Target directory does not exist:', TARGET_DIR)
    process.exit(1)
  }

  const files = fs
    .readdirSync(TARGET_DIR)
    .filter((f) => f.toLowerCase().endsWith('.pdf'))
    .sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, '')) || 0
      const numB = parseInt(b.replace(/\D/g, '')) || 0
      return numA - numB
    })

  console.log(`Found ${files.length} PDF files in folder.\n`)

  let totalFilesProcessed = 0
  let totalRecordsSynced = 0

  // SEQUENTIAL FOR...OF LOOP (CRITICAL TO PREVENT STACK OVERFLOW & DB CONNECTION TIMEOUTS)
  for (let idx = 0; idx < files.length; idx++) {
    const filename = files[idx]
    const filePath = path.join(TARGET_DIR, filename)

    let fileListings: Array<Record<string, any>> = []

    // 1. Check mapping
    if (FILE_LISTINGS_MAP[filename]) {
      fileListings = FILE_LISTINGS_MAP[filename].map((item) => ({
        'Business Name': item.name,
        'Category': item.cat,
        'Primary Phone': item.phone,
        'Secondary Phone': item.secPhone || '',
        'WhatsApp': item.phone,
        'Village': 'Choutuppal',
        'Address': `${item.name}, Choutuppal, Yadadri Bhuvanagiri District`,
        'Description': `${item.name} - ${item.cat} in Choutuppal. Contact: ${item.phone}`,
        'Cover Image': '',
        'Logo': '',
        'Hours': '9 AM - 9 PM',
        'Price': '',
      }))
    }

    // 2. Try pdf-parse as dynamic fallback
    try {
      const buffer = fs.readFileSync(filePath)
      const uint8Array = new Uint8Array(buffer)
      const parser = new PDFParse(uint8Array)
      const pdfData = await parser.getText()
      const text = pdfData.text || ''

      const lines = text
        .split('\n')
        .map((l: string) => l.trim())
        .filter(Boolean)

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]

        if (EXCLUDE_KEYWORDS.some((kw) => line.includes(kw))) {
          continue
        }

        const phoneMatch = line.match(/([6-9]\d{4}\s?\d{5}|[6-9]\d{9})/)
        if (phoneMatch) {
          const numberIndex = line.indexOf(phoneMatch[0])
          let rawTitle = line.substring(0, numberIndex).replace(/^[\d\.\s]+/, '').replace(/[\:\.─\-\_]+$/, '').trim()
          const rawPhones = line.substring(numberIndex).trim()

          if (!rawTitle || rawTitle.length < 2) {
            if (i > 0 && !lines[i - 1].match(/^[0-9\.]/)) {
              rawTitle = lines[i - 1].replace(/^[\d\.\s]+/, '').trim()
            }
          }

          if (rawTitle && rawTitle.length >= 2) {
            const digits = rawPhones.replace(/\D/g, '')
            const primary = digits.length >= 10 ? digits.substring(0, 10) : ''
            const secondary = digits.length >= 20 ? digits.substring(10, 20) : ''

            if (primary) {
              fileListings.push({
                'Business Name': rawTitle,
                'Category': 'Services',
                'Primary Phone': primary,
                'Secondary Phone': secondary,
                'WhatsApp': primary,
                'Village': 'Choutuppal',
                'Address': `${rawTitle}, Choutuppal, Yadadri Bhuvanagiri District`,
                'Description': `${rawTitle} - Services in Choutuppal. Contact: ${primary}`,
                'Cover Image': '',
                'Logo': '',
                'Hours': '9 AM - 9 PM',
                'Price': '',
              })
            }
          }
        }
      }
    } catch (err) {
      // Ignore pdf-parse errors on bitmap images
    }

    // Deduplicate within file
    const uniqueMap = new Map<string, Record<string, any>>()
    for (const item of fileListings) {
      const key = `${item['Business Name']}_${item['Primary Phone']}`
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, item)
      }
    }
    const validListings = Array.from(uniqueMap.values())

    let syncedCountForFile = 0

    if (validListings.length > 0) {
      // Chunking into batches of 50
      const CHUNK_SIZE = 50
      for (let c = 0; c < validListings.length; c += CHUNK_SIZE) {
        const chunk = validListings.slice(c, c + CHUNK_SIZE)
        const success = await sendChunkToAPI(chunk)
        if (success) {
          syncedCountForFile += chunk.length
        }
        // 2-second delay between API calls
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    }

    totalFilesProcessed++
    totalRecordsSynced += syncedCountForFile
    console.log(`Processing file ${idx + 1}/${files.length}: ${filename} -> Synced ${syncedCountForFile} records`)
  }

  console.log('\n====================================================')
  console.log(`Total files processed: ${totalFilesProcessed}. Total records synced: ${totalRecordsSynced}`)
  console.log('====================================================\n')
}

processBulkPDFs()
