import { MessageCircle } from 'lucide-react'

const WHATSAPP_LINK =
  'https://wa.me/919441348175?text=' +
  encodeURIComponent('నమస్తే, చౌటుప్పల్ యాప్ గురించి సమాచారం కావాలి')

export function WhatsAppFloat() {
  return (
    <a
      href={WHATSAPP_LINK}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp us"
      className="fixed bottom-20 right-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-green-500 text-white shadow-lg transition-all hover:scale-110 md:bottom-4"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  )
}
