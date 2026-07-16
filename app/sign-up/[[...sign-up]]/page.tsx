import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ background: "var(--color-surface-soft)" }}
    >
      <style>{`[data-clerk-dev-mode-notice]{display:none!important}`}</style>
      <SignUp path="/sign-up" />
    </div>
  );
}
