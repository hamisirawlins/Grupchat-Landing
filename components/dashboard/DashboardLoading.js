"use client";

export default function DashboardLoading({
  title = "Loading your dashboard",
  subtitle = "Hang tight while we get things ready.",
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 -translate-x-1/2 -translate-y-1/2 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20" />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen">
        <aside className="hidden lg:flex w-80 bg-white/80 backdrop-blur-xl border-r border-white/20 flex-col">
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-white rounded-lg shadow-sm animate-pulse" />
              <div className="h-6 w-28 bg-gradient-to-r from-purple-200 via-purple-100 to-purple-200 rounded-full animate-pulse" />
            </div>
          </div>

          <div className="px-6 pb-4">
            <div className="h-3 w-20 bg-gray-200 rounded-full animate-pulse" />
          </div>

          <div className="px-4 space-y-2 flex-1">
            {[0, 1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-12 bg-white/70 border border-white/40 rounded-xl animate-pulse"
              />
            ))}
          </div>

          <div className="px-4 pb-6">
            <div className="h-12 bg-yellow-200/70 rounded-lg animate-pulse" />
          </div>

          <div className="p-4 border-t border-white/20">
            <div className="h-14 bg-white/70 rounded-xl animate-pulse" />
          </div>
        </aside>

        <div className="flex-1 lg:ml-80">
          <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-40 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-3 w-28 bg-gray-100 rounded-full animate-pulse" />
              </div>
            </div>
          </header>

          <main className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
            <section className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#7a73ff]/20 animate-pulse" />
                <div>
                  <div className="h-5 w-48 bg-gray-200 rounded-full animate-pulse" />
                  <div className="h-4 w-64 bg-gray-100 rounded-full mt-2 animate-pulse" />
                </div>
              </div>
              <div className="h-3 w-32 bg-gray-100 rounded-full animate-pulse" />
            </section>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {[0, 1, 2].map((card) => (
                <div
                  key={card}
                  className="bg-white/80 border border-white/20 rounded-2xl p-6 shadow-sm animate-pulse"
                >
                  <div className="h-4 w-24 bg-gray-200 rounded-full mb-4" />
                  <div className="h-8 w-20 bg-gray-100 rounded-full" />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
              <div className="xl:col-span-2 space-y-4">
                {[0, 1, 2].map((card) => (
                  <div
                    key={card}
                    className="bg-white/80 border border-white/20 rounded-2xl p-4 sm:p-6 shadow-sm animate-pulse"
                  >
                    <div className="h-4 w-40 bg-gray-200 rounded-full mb-3" />
                    <div className="h-3 w-56 bg-gray-100 rounded-full" />
                    <div className="h-2 w-full bg-gray-100 rounded-full mt-6" />
                  </div>
                ))}
              </div>
              <div className="space-y-6 lg:space-y-8">
                {[0, 1, 2].map((chart) => (
                  <div
                    key={chart}
                    className="bg-white/80 border border-white/20 rounded-2xl p-4 sm:p-6 shadow-sm animate-pulse"
                  >
                    <div className="h-4 w-44 bg-gray-200 rounded-full mb-3" />
                    <div className="h-3 w-60 bg-gray-100 rounded-full mb-6" />
                    <div className="h-32 w-full bg-gray-100 rounded-xl" />
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl px-6 py-5 border border-white/30 shadow-xl text-center max-w-sm mx-4">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
