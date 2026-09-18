export default function TopNavbar({ user, onLogout }) {
  const displayName  = user?.name  || user?.email?.split('@')[0] || 'Guest'
  const displayEmail = user?.email || ''
  const initials     = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'G'
  const isGoogle     = user?.provider === 'google'

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm flex items-center justify-between px-6 py-2.5 font-sans">
        {/* Left — Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center shadow-md shadow-teal-700/20">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 4v16M4 12h16" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5" strokeOpacity="0.35" fill="none"/>
            </svg>
          </div>
          <div>
            <span className="font-display font-bold text-base text-slate-900 tracking-tight block leading-none">
              MediCare AI
            </span>
            <span className="text-[11px] font-medium text-teal-600 tracking-wide uppercase">
              Hospital Reception Desk
            </span>
          </div>
        </div>

        {/* Center — System status badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/60">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/>
          <span className="text-xs font-semibold text-teal-800">Hospital System Online</span>
        </div>

        {/* Right — User Profile & Logout */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-1.5">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold font-display shadow-sm ${isGoogle ? 'bg-gradient-to-tr from-blue-600 to-emerald-500' : 'bg-gradient-to-br from-teal-600 to-teal-800'}`}>
              {initials}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-bold text-slate-800 leading-tight">{displayName}</p>
              {displayEmail && <p className="text-[10px] text-slate-400 leading-tight">{displayEmail}</p>}
            </div>
          </div>

          {onLogout && (
            <button onClick={onLogout}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
              Logout
            </button>
          )}
        </div>
      </nav>

      {/* Spacer */}
      <div className="h-14"/>
    </>
  )
}

