const fs = require('fs');
let c = fs.readFileSync('src/app/layout.tsx', 'utf8');
c = c.replace(/<script src="https:\/\/checkout\.razorpay\.com\/v1\/checkout\.js"><\/script>/g, '<Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />');
c = c.replace(/<script async custom-element="amp-auto-ads" src="https:\/\/cdn\.ampproject\.org\/v0\/amp-auto-ads-0\.1\.js"><\/script>/g, '<Script src="https://cdn.ampproject.org/v0/amp-auto-ads-0.1.js" strategy="lazyOnload" />');
c = c.replace(/<Script id="fb-pixel" strategy="afterInteractive">/g, '<Script id="fb-pixel" strategy="lazyOnload">');
fs.writeFileSync('src/app/layout.tsx', c);
