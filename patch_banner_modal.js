const fs = require('fs');

let code = fs.readFileSync('src/components/home/banner-carousel.tsx', 'utf8');

// Replace the modalOpen block with the new layout
const modalRegex = /\{\/\* Full-Screen Banner Modal \*\/\}([\s\S]*?)<\/section>/;

const newModal = `{/* Full-Screen Banner Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 h-screen w-screen bg-black flex items-center justify-center"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="relative h-full w-full bg-black overflow-hidden flex flex-col md:relative md:inset-auto md:h-auto md:max-h-[90vh] md:max-w-3xl md:rounded-3xl md:bg-slate-900 md:border md:border-slate-800 md:p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 z-50 text-white text-3xl cursor-pointer"
            >
              <X className="h-8 w-8" />
            </button>

            {count > 1 ? (
              <>
                <button
                  aria-label="Previous banner"
                  onClick={(e) => { e.stopPropagation(); go(-1); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-50 text-white text-4xl cursor-pointer"
                >
                  <ChevronLeft className="h-10 w-10" />
                </button>
                <button
                  aria-label="Next banner"
                  onClick={(e) => { e.stopPropagation(); go(1); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-50 text-white text-4xl cursor-pointer"
                >
                  <ChevronRight className="h-10 w-10" />
                </button>
              </>
            ) : null}

            {current?.imageUrl ? (
              <div className="relative flex-1 w-full md:aspect-[16/9] overflow-hidden md:rounded-2xl flex items-center justify-center bg-black">
                <img src={current.imageUrl} alt={current.title ?? 'Banner Ad'} className="h-full w-full object-contain" loading="lazy" decoding="async" />
              </div>
            ) : null}

            <div className="p-5 pb-8 md:p-0 md:pt-4 md:pb-0 bg-black md:bg-transparent">
              <h3 className="text-xl md:text-2xl font-black text-white">{current?.title ?? 'Special Offer'}</h3>
              <p className="mt-1 text-xs md:text-sm text-slate-300">
                Reach customers across Choutuppal, Yadadri &amp; nearby villages.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
                {current?.link ? (
                  <a
                    href={current.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={trackClick}
                    className="w-full sm:flex-1"
                  >
                    <Button size="lg" className="w-full gap-2 gradient-brand text-white shadow-lg">
                      <ExternalLink className="h-4 w-4" />
                      Visit Offer / Learn More
                    </Button>
                  </a>
                ) : null}

                <a
                  href={\`https://wa.me/919494348175?text=\${encodeURIComponent(\`"r,? _,, "؅"? ^ ?__"? ݅?__ ,,?݅,? ?"?"_"?: \${current?.title}\`)}\`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:flex-1"
                >
                  <Button size="lg" variant="outline" className="w-full gap-2 border-emerald-500 text-emerald-400 bg-transparent hover:bg-emerald-950">
                    <MessageCircle className="h-4 w-4" />
                    Inquire on WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>`;

code = code.replace(modalRegex, newModal);
fs.writeFileSync('src/components/home/banner-carousel.tsx', code);
console.log('patched banner-carousel.tsx');
