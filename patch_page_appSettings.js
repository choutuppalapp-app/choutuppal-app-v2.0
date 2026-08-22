const fs = require('fs');
const file = 'src/app/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const regex = /let spinEnabled = true\s*try \{\s*const settingsList = await prisma\.setting\.findMany\(\)\s*const settings = settingsList\.reduce\(\(acc, row\) => \{\s*acc\[row\.key\] = row\.value\s*return acc\s*\}, \{\} as Record<string, string>\)\s*if \(settings\.spin_enabled === 'false'\) spinEnabled = false\s*\} catch \(err\) \{\s*console\.error\('\[Home\] settings query error:', err\)\s*\}/;

const replacement = `let spinEnabled = true
  let appSettings: Record<string, string> = {}
  try {
    const settingsList = await prisma.setting.findMany()
    appSettings = settingsList.reduce((acc, row) => {
      acc[row.key] = row.value
      return acc
    }, {} as Record<string, string>)
    if (appSettings.spin_enabled === 'false') spinEnabled = false
  } catch (err) {
    console.error('[Home] settings query error:', err)
  }`;

if (regex.test(code)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync(file, code);
    console.log('patched page.tsx appSettings successfully');
} else {
    console.log('regex did not match in page.tsx');
}
