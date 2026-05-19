import { useEffect } from "react";
import { useLocation } from "wouter";

const FULLSCREEN_PREFIXES = ["/get-started", "/sign-up", "/dashboard"];

export function ScrollToTopOnRoute() {
  const [location] = useLocation();

  useEffect(() => {
    if (FULLSCREEN_PREFIXES.some((p) => location.startsWith(p))) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [location]);

  return null;
}
