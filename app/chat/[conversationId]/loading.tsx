export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <div className="h-14 border-b border-gray-800 flex items-center px-4 gap-3 animate-pulse">
        <div className="w-9 h-9 rounded-full bg-gray-800" />
        <div className="h-4 bg-gray-800 rounded w-32" />
      </div>
      <div className="flex-1 p-4 space-y-3 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className={`h-12 bg-gray-900 rounded-2xl w-3/4 ${i % 2 === 0 ? "ml-auto" : ""}`} />
        ))}
      </div>
    </div>
  );
}
