import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Linkedin, Instagram, Mail, Send } from "lucide-react";
import { useTheme } from "next-themes";
import logoDark from "@assets/jaabili-logo-dark.png";
import logoLight from "@assets/jaabili-logo-light.png";

const SOCIALS = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/jaabili-technologies-420470407/",
    icon: Linkedin,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/jaabili.studio/",
    icon: Instagram,
  },
  {
    label: "Email",
    href: "mailto:jaabilitech@gmail.com",
    icon: Mail,
  },
];

const PLATFORM_LINKS = [
  { label: "Agents", href: "/agents" },
  { label: "Services", href: "/services" },
  { label: "Pricing", href: "/pricing" },
  { label: "Dashboard", href: "/dashboard" },
];

const COMPANY_LINKS = [
  { label: "About", href: "/about" },
  { label: "Contact Sales", href: "/contact" },
  { label: "Get Started", href: "/get-started" },
  { label: "Sign Up", href: "/sign-up" },
];

export default function Footer() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const logo = mounted && resolvedTheme === "light" ? logoLight : logoDark;

  return (
    <footer
      data-site-footer
      className="bg-background border-t border-border pt-20 pb-28 md:pb-12 overflow-hidden relative font-sans"
    >
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 mb-14">
          {/* Brand & description */}
          <div className="md:col-span-5">
            <Link href="/" className="inline-block mb-6">
              <img
                src={logo}
                alt="Jaabili Tech Solutions"
                className="h-24 sm:h-28 w-auto object-contain drop-shadow-[0_0_28px_rgba(20,184,166,0.42)]"
              />
            </Link>
            <p className="text-foreground/55 text-sm leading-relaxed max-w-md mb-8">
              AI agents for small and growing businesses — starting with a
              website agent that answers visitor questions and captures leads
              around the clock.
            </p>

            {/* Newsletter / contact CTA */}
            <a
              href="mailto:jaabilitech@gmail.com"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-foreground/5 border border-border hover:bg-foreground/10 transition-colors text-sm text-foreground/85"
            >
              <Send className="w-3.5 h-3.5 text-primary" />
              <span className="font-medium">jaabilitech@gmail.com</span>
            </a>
          </div>

          {/* Platform */}
          <div className="md:col-span-3 md:col-start-7">
            <h4 className="text-foreground text-xs font-semibold uppercase tracking-[0.18em] mb-5">
              Platform
            </h4>
            <ul className="space-y-3">
              {PLATFORM_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-foreground/55 hover:text-foreground transition-colors text-sm font-normal"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="md:col-span-3">
            <h4 className="text-foreground text-xs font-semibold uppercase tracking-[0.18em] mb-5">
              Company
            </h4>
            <ul className="space-y-3">
              {COMPANY_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-foreground/55 hover:text-foreground transition-colors text-sm font-normal"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex flex-col gap-1">
            <p className="text-foreground/45 text-xs font-medium tracking-wide">
              © {new Date().getFullYear()} Jaabili Tech Solutions. All rights
              reserved.
            </p>
            <p className="text-[10px] uppercase tracking-[0.22em] text-foreground/30 font-semibold">
              Powered by Jaabili Associates
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pr-16 md:pr-0">
            {SOCIALS.map((s) => {
              const Icon = s.icon;
              return (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel={s.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  aria-label={s.label}
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-border bg-foreground/[0.03] text-foreground/70 hover:text-foreground hover:bg-foreground/10 transition-all"
                >
                  <Icon className="w-4 h-4" strokeWidth={1.7} />
                </a>
              );
            })}
            <span className="mx-2 h-5 w-px bg-border" />
            <Link
              href="/privacy"
              className="text-[11px] text-foreground/40 hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-[11px] text-foreground/40 hover:text-foreground transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
