export function CardSkeleton() {
  return (
    <div className="rounded-2xl p-6 bg-white dark:bg-gray-800 shadow-card">
      <div className="shimmer h-4 w-3/4 rounded mb-3" />
      <div className="shimmer h-3 w-full rounded mb-2" />
      <div className="shimmer h-3 w-5/6 rounded mb-4" />
      <div className="shimmer h-10 w-1/3 rounded-lg" />
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="shimmer h-4 w-full rounded" />
        </td>
      ))}
    </tr>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="shimmer w-20 h-20 rounded-full" />
        <div className="space-y-2 flex-1">
          <div className="shimmer h-5 w-1/3 rounded" />
          <div className="shimmer h-4 w-1/4 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="shimmer h-12 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
export function ManagementSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="shimmer h-8 w-1/4 rounded" />
          <div className="shimmer h-4 w-1/3 rounded" />
        </div>
        <div className="shimmer h-10 w-48 rounded-xl" />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="shimmer h-16 w-full rounded-xl mb-4 last:mb-0" />
        ))}
      </div>
    </div>
  );
}
