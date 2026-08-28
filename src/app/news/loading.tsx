export default function Loading() {
  return (
    <div className="min-h-screen p-4">
      <div className="animate-pulse flex flex-wrap gap-4 justify-center">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-64 h-64 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    </div>
  )
}
