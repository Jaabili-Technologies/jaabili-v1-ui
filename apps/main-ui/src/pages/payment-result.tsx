import { Link, useLocation } from "wouter";
import { CheckCircle2, CircleAlert, Clock, Home, LayoutDashboard } from "lucide-react";
import logo from "@assets/jaabili_logo_clean.png";

type PaymentResultStatus = "success" | "failure" | "pending";

const content: Record<
  PaymentResultStatus,
  {
    eyebrow: string;
    title: string;
    body: string;
    icon: typeof CheckCircle2;
    accent: string;
  }
> = {
  success: {
    eyebrow: "Payment confirmed",
    title: "Your Jaabili workspace is ready.",
    body: "We have recorded the subscription payment. You can continue to the dashboard and finish activating your agents.",
    icon: CheckCircle2,
    accent: "text-[#6ee7d8]",
  },
  failure: {
    eyebrow: "Payment not completed",
    title: "The subscription payment failed.",
    body: "No workspace access was charged from this screen. Try again or continue with the free trial if it is available.",
    icon: CircleAlert,
    accent: "text-red-300",
  },
  pending: {
    eyebrow: "Payment pending",
    title: "We are waiting for confirmation.",
    body: "If the amount was deducted, do not retry immediately. We will update the workspace after the payment provider confirms it.",
    icon: Clock,
    accent: "text-amber-300",
  },
};

export default function PaymentResult({
  status = "pending",
}: {
  status?: PaymentResultStatus;
}) {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split("?")[1] ?? "");
  const orderId = params.get("orderId") || params.get("order_id") || params.get("merchant_order_reference");
  const data = content[status];
  const Icon = data.icon;

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#070b12] px-5 py-10 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(20,184,166,0.16),transparent_34%),radial-gradient(circle_at_78%_76%,rgba(125,92,255,0.16),transparent_32%)]" />
      <section className="relative w-full max-w-xl rounded-[32px] border border-white/10 bg-[#0e1724]/92 p-8 text-center shadow-2xl shadow-black/40">
        <img src={logo} alt="Jaabili" className="mx-auto mb-7 h-24 w-auto" />
        <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white/8 ${data.accent}`}>
          <Icon className="h-8 w-8" />
        </div>
        <p className={`text-sm font-semibold ${data.accent}`}>{data.eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          {data.title}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-white/58">
          {data.body}
        </p>

        {orderId && (
          <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left text-sm">
            <p className="text-white/42">Reference</p>
            <p className="mt-1 truncate font-medium text-white/82">{orderId}</p>
          </div>
        )}

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/75 transition hover:bg-white/8 hover:text-white"
          >
            <Home className="h-4 w-4" />
            Home
          </Link>
        </div>
      </section>
    </main>
  );
}
