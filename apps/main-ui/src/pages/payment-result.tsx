import { Link, useLocation } from "wouter";
import { Check, Home, RefreshCw, X } from "lucide-react";

type PaymentResultStatus = "success" | "failure" | "pending";

const copy = {
  success: {
    label: "Payment Successful",
    title: "Your subscription is active.",
    body: "Your Jaabili workspace has been activated. The subscription invoice has been sent to your email.",
    action: "Continue",
    href: "/dashboard",
    tone: "green",
    Icon: Check,
  },
  failure: {
    label: "Payment Failed",
    title: "Payment was not completed.",
    body: "No amount was confirmed for this subscription. Please try again or contact support if money was deducted.",
    action: "Try again",
    href: "/onboarding",
    tone: "red",
    Icon: X,
  },
  pending: {
    label: "Payment Pending",
    title: "We are verifying your payment.",
    body: "If the amount was deducted, please wait for confirmation before retrying.",
    action: "Go to dashboard",
    href: "/dashboard",
    tone: "blue",
    Icon: RefreshCw,
  },
} satisfies Record<
  PaymentResultStatus,
  {
    label: string;
    title: string;
    body: string;
    action: string;
    href: string;
    tone: "green" | "red" | "blue";
    Icon: typeof Check;
  }
>;

const toneClasses = {
  green: {
    ring: "bg-green-100 text-green-700",
    title: "text-green-950",
    button: "bg-green-600 hover:bg-green-700",
  },
  red: {
    ring: "bg-red-100 text-red-700",
    title: "text-red-950",
    button: "bg-red-600 hover:bg-red-700",
  },
  blue: {
    ring: "bg-blue-100 text-blue-700",
    title: "text-blue-950",
    button: "bg-blue-600 hover:bg-blue-700",
  },
};

export default function PaymentResult({
  status = "pending",
}: {
  status?: PaymentResultStatus;
}) {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split("?")[1] ?? "");
  const reference =
    params.get("orderId") ||
    params.get("order_id") ||
    params.get("merchant_order_reference") ||
    params.get("transaction_id");
  const data = copy[status];
  const tone = toneClasses[data.tone];
  const Icon = data.Icon;

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-gray-50 px-4 py-10 text-gray-900">
      <section className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${tone.ring}`}>
          <Icon className="h-9 w-9" strokeWidth={2.4} />
        </div>

        <p className={`mt-5 text-sm font-semibold ${tone.title}`}>{data.label}</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">{data.title}</h1>
        <p className="mt-3 text-sm leading-6 text-gray-600">{data.body}</p>

        {reference && (
          <p className="mt-4 truncate rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
            Order ID: {reference}
          </p>
        )}

        <Link
          href={data.href}
          className={`mt-6 inline-flex w-full items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold text-white transition ${tone.button}`}
        >
          {data.action}
        </Link>

        <Link
          href="/"
          className="mt-5 inline-flex items-center justify-center gap-2 text-sm text-gray-500 transition hover:text-gray-900"
        >
          <Home className="h-4 w-4" />
          Back to home
        </Link>
      </section>
    </main>
  );
}
