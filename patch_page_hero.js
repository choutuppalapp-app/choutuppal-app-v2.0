const fs = require('fs');
const file = 'src/app/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const settingsBlockTarget = `let spinEnabled = true
  try {
    const settingsList = await prisma.setting.findMany()
    const settings = settingsList.reduce((acc, row) => {
      acc[row.key] = row.value
      return acc
    }, {} as Record<string, string>)
    if (settings.spin_enabled === 'false') spinEnabled = false
  } catch (err) {
    console.error('[Home] settings query error:', err)
  }`;

const settingsBlockReplace = `let spinEnabled = true
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

code = code.replace(settingsBlockTarget, settingsBlockReplace);

const heroBlockRegex = /\{\/\* 1\. Hero Section \*\/\}(.|\n|\r)*?<\/section>/;

const heroBlockReplace = `{/* 1. Hero Section */}
        <section 
          className="relative w-full overflow-hidden gradient-brand bg-cover bg-center pt-12 pb-8 sm:pt-20 sm:pb-12 px-4 text-center text-white"
          style={{ backgroundImage: appSettings.hero_bg_image ? \`url('\${appSettings.hero_bg_image}')\` : "url('/images/hero-banner.png')" }}
        >
          {/* Dark Overlay for Readability */}
          <div className="absolute inset-0 bg-black/60 sm:bg-gradient-to-t sm:from-black/80 sm:to-black/30" />
          
          <div className="relative z-10 mx-auto max-w-3xl">
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl md:text-7xl mb-4 text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
              {appSettings.hero_title || 'Choutuppal App'}
            </h1>
            <p className="text-base sm:text-lg md:text-xl font-bold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] mb-6 max-w-2xl mx-auto">
              {appSettings.hero_subtitle || 'Your Town, All In One App'}
            </p>
          </div>
        </section>`;

code = code.replace(heroBlockRegex, heroBlockReplace);

// Remove the ISR revalidate to force dynamic (temporary)
code = code.replace(/export const revalidate = 3600/g, `export const revalidate = 0`);

fs.writeFileSync(file, code);
console.log('patched page.tsx');
