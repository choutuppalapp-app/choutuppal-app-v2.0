import Link from 'next/link'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50/60 via-white to-amber-50/50 p-4">
      <div className="text-center">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-3xl gradient-brand text-4xl font-black text-white shadow-lg">
          404
        </span>
        <h1 className="font-telugu mt-6 text-2xl font-black text-slate-900 sm:text-3xl">
          ఈ పేజీ దొరకలేదు
        </h1>
        <p className="font-telugu mt-2 text-sm text-slate-500">
          మీరు వెతుకుతున్న పేజీ కనిపించడం లేదు. దయచేసి హోమ్ పేజీకి తిరిగి వెళ్లండి.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl gradient-brand px-5 py-2.5 text-sm font-bold text-white shadow-md"
          >
            <Home className="h-4 w-4" />
            హోమ్ పేజీ
          </Link>
          <Link
            href="/community"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-blue-600"
          >
            <Search className="h-4 w-4" />
            కమ్యూనిటీ
          </Link>
        </div>
      </div>
    </div>
  )
}
