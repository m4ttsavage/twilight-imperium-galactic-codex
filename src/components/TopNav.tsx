import { Link, useLocation } from "react-router-dom";
import { Home, Map, BookOpen, GitCompareArrows, User, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/map", label: "Map", icon: Map },
  { to: "/factions", label: "Factions", icon: BookOpen },
  { to: "/factions/compare", label: "Compare", icon: GitCompareArrows },
];

const TopNav = () => {
  const { user, loading } = useAuth();
  const { pathname } = useLocation();

  return (
    <nav className="flex items-center justify-between gap-2 px-4 lg:px-8 pt-4 pb-2">
      {/* Nav links */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {navItems.map(({ to, label, icon: Icon }) => {
          const isActive = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-display uppercase tracking-wider transition-colors ${
                isActive
                  ? "bg-gold/15 border border-gold/30 text-gold"
                  : "bg-muted/30 border border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </Link>
          );
        })}
      </div>

      {/* Auth link */}
      {!loading && (
        user ? (
          <Link
            to="/profile"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-display uppercase tracking-wider transition-colors ${
              pathname === "/profile"
                ? "bg-gold/15 border border-gold/30 text-gold"
                : "bg-muted/30 border border-transparent text-foreground hover:bg-muted/50"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Profile
          </Link>
        ) : (
          <Link
            to="/auth"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted/30 border border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-[10px] font-display uppercase tracking-wider"
          >
            <LogIn className="w-3.5 h-3.5" />
            Sign In
          </Link>
        )
      )}
    </nav>
  );
};

export default TopNav;
