"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);

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
        
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitting(true);
            const formData = new FormData(e.target as HTMLFormElement);
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
          }}
        >
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
