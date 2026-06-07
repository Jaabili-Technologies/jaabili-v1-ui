import { Link, useLocation } from "wouter";
import { useEffect, useRef, useState } from "react";
import { LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@assets/jaabili_logo_clean.png";
import { useAuth } from "@/lib/auth-context";

const publicLinks = [
  { href: "/agents", label: "Agents" },
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const [location, setLocation] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const links = user
    ? [...publicLinks, { href: "/dashboard", label: "Dashboard" }]
    : publicLinks;

  const initials = (user?.displayName || user?.email || "?")
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");

  const handleSignOut = async () => {
    await signOut();
    setMenuOpen(false);
    setLocation("/");
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-white/10 py-3 shadow-sm"
          : "bg-transparent py-5",
      )}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <img
            src={logo}
            alt="Jaabili Tech Solutions"
            className="h-14 sm:h-16 w-auto object-contain drop-shadow-[0_0_22px_rgba(20,184,166,0.5)] opacity-95 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-300"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-7 bg-white/5 px-6 py-2 rounded-full border border-white/10 backdrop-blur-md">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors relative py-1",
                location === link.href
                  ? "text-white"
                  : "text-white/60 hover:text-white",
              )}
            >
              {link.label}
              {location === link.href && (
                <span className="absolute -bottom-0.5 left-0 w-full h-[2px] bg-primary rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                {"photoURL" in user && user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName ?? "User"}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[11px] font-semibold text-primary">
                    {initials || "U"}
                  </div>
                )}
                <span className="hidden sm:block text-sm text-white/90 max-w-[120px] truncate">
                  {user.displayName?.split(" ")[0] ?? user.email?.split("@")[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-white/60" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/5">
                    <p className="text-sm font-medium text-white truncate">
                      {user.displayName ?? "Jaabili user"}
                    </p>
                    <p className="text-xs text-white/50 truncate">
                      {user.email}
                    </p>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/get-started" className="hidden sm:block">
                <button className="text-sm px-4 py-2 text-white/70 hover:text-white font-medium transition-colors">
                  Sign in
                </button>
              </Link>
              <Link href="/sign-up">
                <button className="text-sm px-5 py-2.5 bg-white text-black font-semibold rounded-full hover:bg-white/90 transition-colors">
                  Get Started
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
