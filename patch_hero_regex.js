const fs = require('fs');
const file = 'src/app/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const regex = /\{\/\* 1\. Hero Section \*\/\}(.|\n|\r)*?<\/section>/;

const replacementHero = `{/* 1. Hero Section */}
        <section className="relative w-full overflow-hidden gradient-brand bg-[url('/images/hero-banner.png')] bg-cover bg-center pt-12 pb-8 sm:pt-20 sm:pb-12 px-4 text-center text-white">
          {/* Dark Overlay for Readability */}
          <div className="absolute inset-0 bg-black/60 sm:bg-gradient-to-t sm:from-black/80 sm:to-black/30" />
          
          <div className="relative z-10 mx-auto max-w-3xl">
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl md:text-7xl mb-4 text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
              Choutuppal App
            </h1>
            <p className="text-base sm:text-lg md:text-xl font-bold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] mb-6 max-w-2xl mx-auto">
              Your Town, All In One App
            </p>
          </div>
        </section>`;

code = code.replace(regex, replacementHero);

fs.writeFileSync(file, code);
console.log('patched via regex');
