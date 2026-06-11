import { useEffect, useState } from "react";
import { AlertCircle, Loader2, Mail, RefreshCw, X } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { requestAuthOtp, verifyAuthOtp } from "@/lib/otp-api";

type OtpChannel = "email" | "phone";
type OtpPurpose = "signin" | "signup" | "phone-verification";

interface OtpVerificationModalProps {
  open: boolean;
  channel: OtpChannel;
  destination: string;
  purpose: OtpPurpose;
  onClose: () => void;
  onVerified: () => Promise<void> | void;
}

export function OtpVerificationModal({
  open,
  channel,
  destination,
  purpose,
  onClose,
  onVerified,
}: OtpVerificationModalProps) {
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sent, setSent] = useState(false);

  const sendOtp = async () => {
    if (!destination) return;
    setSending(true);
    setError(null);
    try {
      const result = await requestAuthOtp({ channel, destination, purpose });
      setSent(result.sent);
      setDevCode(result.devCode ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send code.");
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    setCode("");
    setDevCode(null);
    setSent(false);
    void sendOtp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, destination, channel, purpose]);

  if (!open) return null;

  const verify = async () => {
    if (code.length !== 6) {
      setError("Enter the 6-digit verification code.");
      return;
    }
    setVerifying(true);
    setError(null);
    try {
      await verifyAuthOtp({ channel, destination, code });
      await onVerified();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#0d141f] p-6 text-white shadow-2xl shadow-black/50">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#12333a] text-[#6ee7d8]">
              <Mail className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-xl font-semibold">Verify your {channel}</h2>
              <p className="mt-1 text-sm text-white/52">
                We sent a 6-digit code to {destination}.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-white/45 transition hover:bg-white/8 hover:text-white"
            aria-label="Close verification"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-3 rounded-2xl border border-red-400/25 bg-red-500/10 p-3 text-sm text-white/85">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
            <span>{error}</span>
          </div>
        )}

        {devCode && (
          <div className="mb-4 rounded-2xl border border-[#6ee7d8]/25 bg-[#6ee7d8]/10 p-3 text-sm text-[#b9fff6]">
            Local test code: <span className="font-semibold tracking-[0.18em]">{devCode}</span>
          </div>
        )}

        <InputOTP
          maxLength={6}
          value={code}
          onChange={setCode}
          containerClassName="justify-center gap-2 py-2"
        >
          <InputOTPGroup className="gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <InputOTPSlot
                key={index}
                index={index}
                className="h-12 w-12 rounded-2xl border border-white/12 bg-white/[0.045] text-lg text-white first:rounded-2xl last:rounded-2xl"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>

        <button
          type="button"
          onClick={verify}
          disabled={verifying || code.length !== 6}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3.5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {verifying && <Loader2 className="h-4 w-4 animate-spin" />}
          Verify and continue
        </button>

        <button
          type="button"
          onClick={sendOtp}
          disabled={sending}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-white/70 transition hover:bg-white/7 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {sent ? "Resend code" : "Send code"}
        </button>
      </div>
    </div>
  );
}
