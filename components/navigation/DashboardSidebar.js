import SidebarLogo from "@/components/navigation/SidebarLogo";
import { ChevronRight, LogOut, X } from "lucide-react";

export default function DashboardSidebar({
  mobileMenuOpen,
  onClose,
  primaryNavItems,
  accountNavItems,
  activeTab,
  onPrimaryNavClick,
  onAccountNavClick,
  onLogout,
  user,
  profile,
}) {
  return (
    <>
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`w-80 bg-white/80 backdrop-blur-xl border-r border-white/20 fixed h-full z-50 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="p-6">
          <div className="flex items-center justify-between">
            <SidebarLogo />
            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="px-6 space-y-6 flex-1 overflow-y-auto">
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-[0.2em]">
              Home
            </h2>
            <div className="space-y-2">
              {primaryNavItems.map((item) => {
                const isActive = item.active || activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onPrimaryNavClick(item)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-full text-left transition-all duration-200 ${
                      isActive
                        ? "bg-[#7a73ff] text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-9 h-9 rounded-full flex items-center justify-center border ${
                          isActive
                            ? "bg-white/20 border-white/30 text-white"
                            : "bg-white border-gray-200 text-gray-700"
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                      </span>
                      <span className="font-medium">{item.label}</span>
                      {item.id === "plot" && (
                        <span className="ml-1 text-[9px] uppercase tracking-[0.18em] bg-[#f5f6ff] text-[#6b63ff] px-1.5 py-0.5 rounded-full">
                          Coming soon
                        </span>
                      )}
                    </div>
                    {item.badge && (
                      <span className="bg-white text-[#7a73ff] text-xs rounded-full min-w-[24px] h-6 px-1.5 flex items-center justify-center font-semibold">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-[0.2em]">
              Account
            </h2>
            <div className="space-y-2">
              {accountNavItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onAccountNavClick(item)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-full text-left transition-all duration-200 ${
                      isActive
                        ? "bg-[#7a73ff] text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span
                      className={`w-9 h-9 rounded-full flex items-center justify-center border ${
                        isActive
                          ? "bg-white/20 border-white/30 text-white"
                          : "bg-white border-gray-200 text-gray-700"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                    </span>
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Coffee Support Button */}
        <div className="px-6 pb-4">
          <a
            href="https://buymeacoffee.com/grupchat"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-between w-full px-4 py-3 bg-[#f7f4ff] border border-purple-100 rounded-2xl text-sm font-semibold text-[#6b63ff] hover:bg-white hover:shadow-md transition-all duration-200"
          >
            <span className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-[#7a73ff] text-white flex items-center justify-center text-base">
                ☕️
              </span>
              Buy Us a Coffee
            </span>
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>

        {/* User Profile Section - Sticky to Bottom */}
        <div className="p-6 border-t border-gray-100 bg-white/80">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 px-4 py-3 text-left bg-white border border-gray-100 rounded-2xl">
              <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center font-semibold">
                {profile?.avatarUrl ? (
                  <img
                    src={profile?.avatarUrl}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (profile?.displayName || user?.email || ";)")
                    .charAt(0)
                    .toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {profile?.displayName || "User"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  @{profile?.username || user?.email?.split("@")[0] || "user"}
                </p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
