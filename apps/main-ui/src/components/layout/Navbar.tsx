import { Link, useLocation } from "wouter";
import { useEffect, useRef, useState } from "react";
import { LogOut, LayoutDashboard, ChevronDown, Sun, Moon, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import logoDark from "@assets/jaabili-logo-dark.png";
import logoLight from "@assets/jaabili-logo-light.png";
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setAvatarFailed(false);
  }, [user?.photoURL]);

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

  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [location]);

  useEffect(() => {
    document.documentElement.classList.toggle("jaabili-no-page-scroll", mobileOpen);
    return () => document.documentElement.classList.remove("jaabili-no-page-scroll");
  }, [mobileOpen]);

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
    setMobileOpen(false);
    setLocation("/");
  };

  const logo = mounted && resolvedTheme === "light" ? logoLight : logoDark;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
        scrolled || mobileOpen
          ? "bg-background/80 backdrop-blur-xl border-border py-3 shadow-sm"
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

        <nav className="hidden md:flex items-center gap-7 bg-foreground/5 px-6 py-2 rounded-full border border-border backdrop-blur-md">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors relative py-1",
                location === link.href
                  ? "text-foreground"
                  : "text-foreground/60 hover:text-foreground",
              )}
            >
              {link.label}
              {location === link.href && (
                <span className="absolute -bottom-0.5 left-0 w-full h-[2px] bg-primary rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {!user && (
            <button
              type="button"
              onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
              aria-label="Toggle color theme"
              className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full border border-border bg-foreground/5 text-foreground/70 hover:text-foreground hover:bg-foreground/10 transition-colors"
            >
              {mounted && resolvedTheme === "light" ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </button>
          )}
          {user ? (
            <div className="relative hidden md:block" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-foreground/5 hover:bg-foreground/10 border border-border transition-colors"
              >
                {user.photoURL && !avatarFailed ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName ?? "User"}
                    referrerPolicy="no-referrer"
                    onError={() => setAvatarFailed(true)}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[11px] font-semibold text-primary">
                    {initials || "U"}
                  </div>
                )}
                <span className="hidden sm:block text-sm text-foreground/90 max-w-[120px] truncate">
                  {user.displayName?.split(" ")[0] ?? user.email?.split("@")[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-foreground/60" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-medium text-foreground truncate">
                      {user.displayName ?? "Jaabili user"}
                    </p>
                    <p className="text-xs text-foreground/50 truncate">
                      {user.email}
                    </p>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <div className="flex items-center justify-between px-4 py-2.5 text-sm text-foreground/80">
                    <span>Theme</span>
                    <div className="flex items-center gap-1 rounded-full border border-border bg-foreground/5 p-0.5">
                      <button
                        type="button"
                        onClick={() => setTheme("light")}
                        aria-label="Light theme"
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full transition-colors",
                          mounted && resolvedTheme === "light"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-foreground/45 hover:text-foreground",
                        )}
                      >
                        <Sun className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setTheme("dark")}
                        aria-label="Dark theme"
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full transition-colors",
                          mounted && resolvedTheme === "dark"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-foreground/45 hover:text-foreground",
                        )}
                      >
                        <Moon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 border-t border-border px-4 py-2.5 text-sm text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link href="/get-started">
                <button className="text-sm px-4 py-2 text-foreground/70 hover:text-foreground font-medium transition-colors">
                  Sign in
                </button>
              </Link>
              <Link href="/sign-up">
                <button className="text-sm px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-full hover:opacity-90 transition-colors">
                  Get Started
                </button>
              </Link>
            </div>
          )}

          {!user && (
            <Link href="/sign-up" className="md:hidden">
              <button className="text-sm px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-full hover:opacity-90 transition-colors">
                Get Started
              </button>
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-full border border-border bg-foreground/5 text-foreground/80 hover:text-foreground hover:bg-foreground/10 transition-colors"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl">
          <nav className="container mx-auto px-6 py-4 flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-xl px-3 py-3 text-base font-medium transition-colors",
                  location === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/75 hover:bg-foreground/5 hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-2 flex items-center justify-between rounded-xl px-3 py-3 text-base font-medium text-foreground/75">
              <span>Theme</span>
              <div className="flex items-center gap-1 rounded-full border border-border bg-foreground/5 p-0.5">
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  aria-label="Light theme"
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full transition-colors",
                    mounted && resolvedTheme === "light"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-foreground/45 hover:text-foreground",
                  )}
                >
                  <Sun className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  aria-label="Dark theme"
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full transition-colors",
                    mounted && resolvedTheme === "dark"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-foreground/45 hover:text-foreground",
                  )}
                >
                  <Moon className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-3 border-t border-border pt-3">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-2">
                    {user.photoURL && !avatarFailed ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName ?? "User"}
                        referrerPolicy="no-referrer"
                        onError={() => setAvatarFailed(true)}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-semibold text-primary">
                        {initials || "U"}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {user.displayName ?? "Jaabili user"}
                      </p>
                      <p className="text-xs text-foreground/50 truncate">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="mt-1 w-full flex items-center gap-2 rounded-xl px-3 py-3 text-base font-medium text-foreground/75 hover:bg-foreground/5 hover:text-foreground transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link href="/get-started">
                    <button className="w-full rounded-xl border border-border px-3 py-3 text-base font-medium text-foreground/85 hover:bg-foreground/5 transition-colors">
                      Sign in
                    </button>
                  </Link>
                  <Link href="/sign-up">
                    <button className="w-full rounded-xl bg-primary px-3 py-3 text-base font-semibold text-primary-foreground hover:opacity-90 transition-colors">
                      Get Started
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
