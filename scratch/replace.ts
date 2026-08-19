import fs from 'fs'

const stickyFile = 'src/components/home/sticky-socials.tsx'
const pricingFile = 'src/components/home/pricing-plans.tsx'

let sticky = fs.readFileSync(stickyFile, 'utf8')
sticky = sticky.replace(/import \{ SiWhatsapp, SiYoutube, SiInstagram, SiFacebook \} from '@icons-pack\/react-simple-icons'/g, "import { MessageCircle, Youtube, Instagram, Facebook } from 'lucide-react'")
sticky = sticky.replace(/<SiWhatsapp/g, "<MessageCircle")
sticky = sticky.replace(/<SiYoutube/g, "<Youtube")
sticky = sticky.replace(/<SiInstagram/g, "<Instagram")
sticky = sticky.replace(/<SiFacebook/g, "<Facebook")
fs.writeFileSync(stickyFile, sticky)

let pricing = fs.readFileSync(pricingFile, 'utf8')
pricing = pricing.replace(/import \{ SiWhatsapp, SiYoutube, SiInstagram, SiFacebook \} from '@icons-pack\/react-simple-icons'/g, "import { Youtube, Instagram, Facebook } from 'lucide-react'")
pricing = pricing.replace(/<SiWhatsapp/g, "<MessageCircle")
pricing = pricing.replace(/<SiYoutube/g, "<Youtube")
pricing = pricing.replace(/<SiInstagram/g, "<Instagram")
pricing = pricing.replace(/<SiFacebook/g, "<Facebook")
fs.writeFileSync(pricingFile, pricing)
