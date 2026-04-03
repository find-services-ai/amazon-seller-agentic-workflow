import { LogOut } from 'lucide-react'

export default function Header({ user, onLogout }) {
  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center">
            <span className="text-black font-bold text-xs">S</span>
          </div>
          <span className="text-sm font-semibold text-text-primary">Seller Platform</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-caption text-text-muted hidden sm:block">{user?.name || user?.email}</span>
          {onLogout && (
            <button
              onClick={onLogout}
              className="btn-ghost text-xs py-1.5 px-3 min-h-0"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
