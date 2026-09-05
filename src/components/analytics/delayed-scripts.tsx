'use client'

import { useState, useEffect } from 'react'


export function DelayedScripts({ gaId, fbPixelId }: { gaId: string | null, fbPixelId: string | null }) {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const handleInteraction = () => {
      setShouldLoad(true);
      removeEventListeners();
    };

    const removeEventListeners = () => {
      window.removeEventListener('scroll', handleInteraction);
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };

    window.addEventListener('scroll', handleInteraction);
    window.addEventListener('mousemove', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);

    const timeoutId = setTimeout(() => {
      setShouldLoad(true);
      removeEventListeners();
    }, 5000);

    return () => {
      clearTimeout(timeoutId);
      removeEventListeners();
    };
  }, []);

  useEffect(() => {
    if (!shouldLoad) return;

    const injectScript = (src: string, isAsync = true, crossOrigin?: string) => {
      if (document.querySelector(`script[src="${src}"]`)) return;
      const script = document.createElement('script');
      script.src = src;
      script.async = isAsync;
      if (crossOrigin) script.crossOrigin = crossOrigin;
      document.body.appendChild(script);
    };

    const injectInlineScript = (id: string, code: string) => {
      if (document.getElementById(id)) return;
      const script = document.createElement('script');
      script.id = id;
      script.innerHTML = code;
      document.body.appendChild(script);
    };

    // Google Ads
    injectScript('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1914892456105863', true, 'anonymous');
    
    // Razorpay
    injectScript('https://checkout.razorpay.com/v1/checkout.js', true);
    
    // AMP Ads
    injectScript('https://cdn.ampproject.org/v0/amp-auto-ads-0.1.js', true);

    // Google Analytics
    if (gaId) {
      injectScript(`https://www.googletagmanager.com/gtag/js?id=${gaId}`, true);
      injectInlineScript('google-analytics', `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${gaId}', {
          page_path: window.location.pathname,
        });
      `);
    }

    // Facebook Pixel
    if (fbPixelId) {
      injectInlineScript('fb-pixel', `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${fbPixelId}');
        fbq('track', 'PageView');
      `);
    }
  }, [shouldLoad, gaId, fbPixelId]);

  if (!shouldLoad) return null;

  return (
    <>
      {/* @ts-ignore */}
      <amp-auto-ads type="adsense" data-ad-client="ca-pub-1914892456105863"></amp-auto-ads>
    </>
  )
}
