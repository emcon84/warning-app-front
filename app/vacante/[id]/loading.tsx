export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-950 pt-20 px-4">
      <div className="max-w-xl mx-auto animate-pulse">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-24 h-24 rounded-2xl bg-gray-800 flex-shrink-0" />
          <div className="flex-1 space-y-3 pt-2">
            <div className="h-5 bg-gray-800 rounded-lg w-3/4" />
            <div className="h-4 bg-gray-800 rounded-lg w-1/2" />
            <div className="h-4 bg-gray-800 rounded-lg w-1/3" />
          </div>
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-gray-900 rounded-2xl mb-3" />
        ))}
      </div>
    </div>
  );
}
