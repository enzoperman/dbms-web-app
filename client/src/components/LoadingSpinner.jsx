import { Loader2 } from "lucide-react";

export default function LoadingSpinner({ message = "Loading...", size = "default" }) {
  const sizeClasses = {
    small: "h-5 w-5",
    default: "h-8 w-8",
    large: "h-12 w-12",
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
        {/* Spinning loader */}
        <Loader2 
          className={`${sizeClasses[size]} animate-spin text-red-800`} 
        />
      </div>
      <p className="mt-4 text-sm font-medium text-gray-600 animate-pulse">
        {message}
      </p>
    </div>
  );
}

export function PageLoading({ message = "Loading..." }) {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center">
        <div className="relative inline-flex">
          <div className="h-12 w-12 rounded-full border-4 border-red-200"></div>
          <div className="absolute left-0 top-0 h-12 w-12 animate-spin rounded-full border-4 border-red-800 border-t-transparent"></div>
        </div>
        <p className="mt-4 text-gray-600 animate-pulse">{message}</p>
      </div>
    </div>
  );
}

export function TableLoading() {
  return (
    <div className="p-8">
      <div className="flex flex-col items-center justify-center">
        <div className="relative inline-flex">
          <div className="h-10 w-10 rounded-full border-4 border-red-200"></div>
          <div className="absolute left-0 top-0 h-10 w-10 animate-spin rounded-full border-4 border-red-800 border-t-transparent"></div>
        </div>
        <p className="mt-3 text-sm text-gray-500">Loading data...</p>
        {/* Skeleton rows */}
        <div className="mt-6 w-full max-w-md space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="h-10 w-10 rounded-full bg-gray-200"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                <div className="h-3 w-1/2 rounded bg-gray-200"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
