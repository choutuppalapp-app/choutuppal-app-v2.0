const fs = require('fs');
const file = 'src/app/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const targetHero = `        {/* 1. Hero Section */}
        <section className="relative w-full overflow-hidden gradient-brand pt-12 pb-8 sm:pt-20 sm:pb-12 px-4 text-center text-white">
          <div className="relative z-10 mx-auto max-w-3xl">
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl md:text-7xl mb-4 text-white drop-shadow-md">
              Choutuppal App
            </h1>
            <p className="text-base sm:text-lg md:text-xl font-medium text-white/90 drop-shadow-sm mb-6 max-w-2xl mx-auto">
              Your digital gateway to everything happening in and around Choutuppal. Discover local businesses, news, properties, and community updates all in one place.
            </p>
          </div>
          {/* Decorative Background Elements */}
          <div className="absolute left-1/2 top-0 h-64 w-[900px] -translate-x-1/2 rounded-full bg-white/10 blur-[80px]" />
        </section>`;

const replacementHero = `        {/* 1. Hero Section */}
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

code = code.replace(targetHero, replacementHero);

fs.writeFileSync(file, code);
console.log('patched hero section');
