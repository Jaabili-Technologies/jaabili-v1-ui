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
  completed: true;
  completedAt: string;
}

const KEY = "jaabili_onboarding";

export function readOnboarding(): OnboardingPrefs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OnboardingPrefs;
    if (parsed?.completed) return parsed;
    return null;
  } catch {
    return null;
  }
}

export function saveOnboarding(prefs: Omit<OnboardingPrefs, "completed" | "completedAt">) {
  if (typeof window === "undefined") return;
  const full: OnboardingPrefs = {
    ...prefs,
    completed: true,
    completedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(KEY, JSON.stringify(full));
}

export function clearOnboarding() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

export function hasCompletedOnboarding(): boolean {
  return readOnboarding() !== null;
}
