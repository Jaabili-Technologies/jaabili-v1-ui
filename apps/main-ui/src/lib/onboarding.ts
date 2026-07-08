export interface OnboardingPrefs {
  role: string;
  useCase: string;
  teamSize: string;
  source: string;
  channels: string[];
  plan?: string;
  selectedAgents?: string[];
  companyName?: string;
  website?: string;
  industry?: string;
  targetCustomer?: string;
  monthlyLeads?: string;
  salesOwner?: string;
  knowledgeSources?: string[];
  launchMode?: string;
  workspaceType?: string;
  aiExperience?: string;
  workspaceOwnerEmail?: string;
  automationGoals?: string[];
  businessDescription?: string;
  servicesOffered?: string;
  commonQuestions?: string;
  brandTone?: string;
  selectedPlanName?: string;
  couponCode?: string;
  paymentGateway?: string;
  paymentMode?: string;
  paymentProvider?: string;
  tenantId?: string;
  widgetPublicKey?: string | null;
  completed: true;
  completedAt: string;
}

const LEGACY_KEY = "jaabili_onboarding";

// Onboarding completion is tracked per signed-in user (keyed by uid), not as a single
// global browser flag — otherwise signing in as a different account (or re-testing) on
// the same browser would skip onboarding since a previous account already completed it.
function keyFor(uid: string): string {
  return `${LEGACY_KEY}:${uid}`;
}

export function readOnboarding(uid: string | null | undefined): OnboardingPrefs | null {
  if (typeof window === "undefined" || !uid) return null;
  try {
    const raw = window.localStorage.getItem(keyFor(uid));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OnboardingPrefs;
    if (parsed?.completed) return parsed;
    return null;
  } catch {
    return null;
  }
}

export function saveOnboarding(uid: string, prefs: Omit<OnboardingPrefs, "completed" | "completedAt">) {
  if (typeof window === "undefined") return;
  const full: OnboardingPrefs = {
    ...prefs,
    completed: true,
    completedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(keyFor(uid), JSON.stringify(full));
}

export function clearOnboarding(uid: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(keyFor(uid));
}

export function hasCompletedOnboarding(uid: string | null | undefined): boolean {
  return readOnboarding(uid) !== null;
}
