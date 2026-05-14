export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-950 pt-20 px-4">
      <div className="max-w-xl mx-auto animate-pulse">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-gray-800" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-800 rounded w-32" />
            <div className="h-3 bg-gray-800 rounded w-24" />
          </div>
        </div>
        <div className="flex gap-2 mb-4">
          {[1, 2, 3].map(i => <div key={i} className="h-9 bg-gray-800 rounded-xl flex-1" />)}
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-gray-900 rounded-2xl border border-gray-800 mb-3" />
        ))}
      </div>
    </div>
  );
}
