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
import WebsiteSalesAgentPage from "@/pages/website-sales-agent";
import Terms from "@/pages/terms";
import Privacy from "@/pages/privacy";
import PaymentResult from "@/pages/payment-result";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

const FULLSCREEN_ROUTES = [
  "/get-started",
  "/sign-up",
  "/onboarding",
  "/dashboard",
  "/dashboard/agents/website-sales",
  "/agents/website-sales",
  "/terms",
  "/privacy",
  "/payment/success",
  "/payment/failure",
  "/payment/pending",
];

const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  const [location] = useLocation();
  const isFullscreen = FULLSCREEN_ROUTES.some((p) => location.startsWith(p));

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location}
        initial={{ opacity: 0, filter: "blur(10px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, filter: "blur(10px)" }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className={
          isFullscreen
            ? "flex h-full min-h-0 flex-col overflow-hidden"
            : "flex min-h-[100dvh] flex-col"
        }
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

function Router() {
  const [location] = useLocation();
  const isFullscreen = FULLSCREEN_ROUTES.some((p) => location.startsWith(p));

  useEffect(() => {
    document.documentElement.classList.toggle("jaabili-no-page-scroll", isFullscreen);
    document.body.classList.toggle("jaabili-no-page-scroll", isFullscreen);

    return () => {
      document.documentElement.classList.remove("jaabili-no-page-scroll");
      document.body.classList.remove("jaabili-no-page-scroll");
    };
  }, [isFullscreen]);

  return (
    <div
      className={
        isFullscreen
          ? "flex h-[100dvh] min-h-0 flex-col overflow-hidden"
          : "flex min-h-screen flex-col"
      }
    >
      <ScrollToTopOnRoute />
      <BackToTop />
      {!isFullscreen && <Navbar />}
      <main className={isFullscreen ? "min-h-0 flex-1 overflow-hidden" : "flex-1"}>
        <PageWrapper>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/dashboard/agents/website-sales">
              <ProtectedRoute component={WebsiteSalesAgentPage} />
            </Route>
            <Route path="/agents/website-sales" component={WebsiteSalesAgentPage} />
            <Route path="/agents" component={Agents} />
            <Route path="/services" component={Services} />
            <Route path="/pricing" component={Pricing} />
            <Route path="/about" component={About} />
            <Route path="/contact" component={Contact} />
            <Route path="/terms" component={Terms} />
            <Route path="/privacy" component={Privacy} />
            <Route path="/payment/success">
              <PaymentResult status="success" />
            </Route>
            <Route path="/payment/failure">
              <PaymentResult status="failure" />
            </Route>
            <Route path="/payment/pending">
              <PaymentResult status="pending" />
            </Route>
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
