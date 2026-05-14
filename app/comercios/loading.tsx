export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-950 pt-20 px-4">
      <div className="max-w-2xl mx-auto animate-pulse">
        <div className="h-8 bg-gray-800 rounded-xl w-48 mb-6" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-20 bg-gray-900 rounded-2xl border border-gray-800" />
          ))}
        </div>
      </div>
    </div>
  );
}
