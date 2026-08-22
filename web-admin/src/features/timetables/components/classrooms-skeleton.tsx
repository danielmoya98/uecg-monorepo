export function ClassroomsSkeleton() {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-pulse"
      role="status"
      aria-label="Cargando aulas..."
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col border border-uecg-line bg-white h-44 relative overflow-hidden"
        >
          <div className="p-5 flex-1 w-full flex flex-col gap-3">
            <div className="h-4 w-16 bg-gray-200 rounded-none" />
            <div className="h-6 w-3/4 bg-gray-300 mt-2 rounded-none" />
            <div className="h-3 w-1/3 bg-gray-200 rounded-none" />
          </div>
          <div className="w-full p-4 border-t border-uecg-line bg-gray-50 flex justify-between items-center">
            <div className="h-3 w-20 bg-gray-200 rounded-none" />
            <div className="h-4 w-4 bg-gray-300 rounded-none" />
          </div>
        </div>
      ))}
    </div>
  )
}
