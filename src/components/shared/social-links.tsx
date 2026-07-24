import { Instagram, Facebook, Youtube, MessageCircle, Megaphone } from 'lucide-react'

const LINKS = [
  { icon: Instagram, label: 'Instagram', href: 'https://www.instagram.com/choutuppalapp/', color: 'bg-pink-600 text-white' },
  { icon: Facebook, label: 'Facebook', href: 'https://www.facebook.com/Choutuppalapp/', color: 'bg-blue-600 text-white' },
  { icon: Youtube, label: 'YouTube', href: 'https://www.youtube.com/@choutuppalapp', color: 'bg-red-600 text-white' },
  { icon: MessageCircle, label: 'WhatsApp Community', href: 'https://chat.whatsapp.com/Lldpx4K3oECGGTD3ckBgM3', color: 'bg-green-500 text-white' },
  { icon: Megaphone, label: 'WhatsApp Channel', href: 'https://whatsapp.com/channel/0029VbAyp614IBhHFXOBXv08', color: 'bg-green-700 text-white' },
]

export function SocialLinks() {
  return (
    <div className="flex items-center gap-3">
      {LINKS.map((l) => {
        const Icon = l.icon
        return (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            title={l.label}
            aria-label={l.label}
            className={`flex h-10 w-10 items-center justify-center rounded-full shadow-sm transition-all hover:scale-110 ${l.color}`}
          >
            <Icon className="h-5 w-5" />
          </a>
        )
      })}
    </div>
  )
}
