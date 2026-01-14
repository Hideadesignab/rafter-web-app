export function MessageSkeleton() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="w-full max-w-[800px] mx-auto px-6 py-4 space-y-4">
        {/* User message skeleton */}
        <div className="flex justify-end">
          <div className="bg-gray-200 rounded-2xl rounded-br-md h-14 w-2/3 animate-pulse" />
        </div>

        {/* Assistant message skeleton - longer */}
        <div className="flex justify-start">
          <div className="bg-gray-200 rounded-2xl rounded-bl-md h-24 w-full animate-pulse" />
        </div>

        {/* User message skeleton - shorter */}
        <div className="flex justify-end">
          <div className="bg-gray-200 rounded-2xl rounded-br-md h-10 w-1/2 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
