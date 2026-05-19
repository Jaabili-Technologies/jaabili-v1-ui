import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/lib/auth-context";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { ScrollToTopOnRoute } from "@/components/util/scroll-to-top-on-route";
import { BackToTop } from "@/components/util/back-to-top";
import { BrandPreloader } from "@/components/ui/brand-loader";

import Home from "@/pages/home";
import Agents from "@/pages/agents";
import Services from "@/pages/services";
import Pricing from "@/pages/pricing";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import GetStarted from "@/pages/get-started";
import SignUp from "@/pages/sign-up";
import Onboarding from "@/pages/onboarding";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  const [location] = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location}
        initial={{ opacity: 0, filter: "blur(10px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, filter: "blur(10px)" }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="min-h-[100dvh] flex flex-col"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

const FULLSCREEN_ROUTES = [
  "/get-started",
  "/sign-up",
  "/onboarding",
  "/dashboard",
];

function Router() {
  const [location] = useLocation();
  const isFullscreen = FULLSCREEN_ROUTES.some((p) => location.startsWith(p));

  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTopOnRoute />
      <BackToTop />
      {!isFullscreen && <Navbar />}
      <main className="flex-1">
        <PageWrapper>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/agents" component={Agents} />
            <Route path="/services" component={Services} />
            <Route path="/pricing" component={Pricing} />
            <Route path="/about" component={About} />
            <Route path="/contact" component={Contact} />
            <Route path="/get-started" component={GetStarted} />
            <Route path="/sign-up" component={SignUp} />
            <Route path="/onboarding">
              <ProtectedRoute
                component={Onboarding}
                requireOnboarding={false}
              />
            </Route>
            <Route path="/dashboard">
              <ProtectedRoute component={Dashboard} />
            </Route>
            <Route component={NotFound} />
          </Switch>
        </PageWrapper>
      </main>
      {!isFullscreen && <Footer />}
    </div>
  );
}

function App() {
  const [showPreloader, setShowPreloader] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowPreloader(false), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <BrandPreloader show={showPreloader} />
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
