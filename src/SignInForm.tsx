
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";

type FlowType = "signIn" | "signUp" | "reset" | "reset-verification";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<FlowType>("signIn");
  const [submitting, setSubmitting] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  // Handle password reset request
  const handleResetRequest = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    formData.set("flow", "reset");

    void signIn("password", formData)
      .then(() => {
        setResetEmail(email);
        setFlow("reset-verification");
        toast.success("Verification code sent to your email!");
        setSubmitting(false);
      })
      .catch((error) => {
        toast.error(error.message || "Could not send reset email. Please try again.");
        setSubmitting(false);
      });
  };

  // Handle password reset verification
  const handleResetVerification = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.set("email", resetEmail);
    formData.set("flow", "reset-verification");

    void signIn("password", formData)
      .then(() => {
        toast.success("Password reset successful!");
        setFlow("signIn");
        setResetEmail("");
        setSubmitting(false);
      })
      .catch((error) => {
        toast.error(error.message || "Invalid code. Please try again.");
        setSubmitting(false);
      });
  };

  // Handle resend code
  const handleResendCode = () => {
    setSubmitting(true);
    const formData = new FormData();
    formData.set("email", resetEmail);
    formData.set("flow", "reset");

    void signIn("password", formData)
      .then(() => {
        toast.success("New verification code sent!");
        setSubmitting(false);
      })
      .catch((error) => {
        toast.error(error.message || "Could not resend code. Please try again.");
        setSubmitting(false);
      });
  };

  // Handle sign in / sign up
  const handleSignInUp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.set("flow", flow);

    void signIn("password", formData).catch((error) => {
      let toastTitle = "";
      if (error.message.includes("Invalid password")) {
        toastTitle = "Invalid password. Please try again.";
      } else {
        toastTitle =
          flow === "signIn"
            ? "Could not sign in, did you mean to sign up?"
            : "Could not sign up, did you mean to sign in?";
      }
      toast.error(toastTitle);
      setSubmitting(false);
    });
  };

  // Render password reset request form
  if (flow === "reset") {
    return (
      <div className="w-full max-w-md mx-auto px-4">
        <div className="card p-6 sm:p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Reset Password
            </h2>
            <p className="text-gray-600">
              Enter your email to receive a verification code
            </p>
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleResetRequest}>
            <div>
              <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                className="input-field"
                type="email"
                id="reset-email"
                name="email"
                placeholder="Enter your email"
                required
              />
            </div>

            <button
              className="btn-primary mt-2"
              type="submit"
              disabled={submitting}
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                "Send Code"
              )}
            </button>

            <button
              type="button"
              className="text-sm text-primary-600 hover:text-primary-800 hover:underline font-medium cursor-pointer"
              onClick={() => setFlow("signIn")}
            >
              Back to Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Render verification code form
  if (flow === "reset-verification") {
    return (
      <div className="w-full max-w-md mx-auto px-4">
        <div className="card p-6 sm:p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Enter Verification Code
            </h2>
            <p className="text-gray-600">
              We sent a code to <span className="font-medium">{resetEmail}</span>
            </p>
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleResetVerification}>
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                Verification Code
              </label>
              <input
                className="input-field text-center text-xl tracking-widest"
                type="text"
                id="code"
                name="code"
                placeholder="12345678"
                maxLength={8}
                required
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                className="input-field"
                type="password"
                id="newPassword"
                name="newPassword"
                placeholder="Enter new password"
                required
              />
            </div>

            <button
              className="btn-primary mt-2"
              type="submit"
              disabled={submitting}
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Resetting...
                </span>
              ) : (
                "Reset Password"
              )}
            </button>

            <div className="flex justify-between items-center text-sm">
              <button
                type="button"
                className="text-primary-600 hover:text-primary-800 hover:underline font-medium cursor-pointer"
                onClick={handleResendCode}
                disabled={submitting}
              >
                Resend Code
              </button>
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
                onClick={() => {
                  setFlow("signIn");
                  setResetEmail("");
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Render sign in / sign up form
  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="card p-6 sm:p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {flow === "signIn" ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-gray-600">
            {flow === "signIn"
              ? "Sign in to continue to your dashboard"
              : "Create an account to get started"}
          </p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSignInUp}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              className="input-field"
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              className="input-field"
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              required
            />
          </div>

          {flow === "signIn" && (
            <div className="text-right">
              <button
                type="button"
                className="text-sm text-primary-600 hover:text-primary-800 hover:underline font-medium cursor-pointer"
                onClick={() => setFlow("reset")}
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            className="btn-primary mt-2"
            type="submit"
            disabled={submitting}
          >
            {submitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              flow === "signIn" ? "Sign in" : "Sign up"
            )}
          </button>

          <div className="text-center text-sm text-gray-600 mt-4">
            <span>
              {flow === "signIn"
                ? "Don't have an account? "
                : "Already have an account? "}
            </span>
            <button
              type="button"
              className="text-primary-600 hover:text-primary-800 hover:underline font-medium cursor-pointer"
              onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
            >
              {flow === "signIn" ? "Sign up instead" : "Sign in instead"}
            </button>
          </div>
        </form>

        <div className="flex items-center justify-center my-6">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="mx-4 text-gray-500 text-sm">or</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <button
          className="btn-secondary flex items-center justify-center gap-2"
          onClick={() => void signIn("anonymous")}
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
          Continue as Guest
        </button>
      </div>
    </div>
  );
}
