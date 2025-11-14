import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { EventManagement } from "./components/EventManagement";
import { EventRegistration } from "./components/EventRegistration";
import { AttendeeList } from "./components/AttendeeList";
import { Analytics } from "./components/Analytics";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm h-16 flex justify-between items-center border-b border-gray-200 px-4 sm:px-6 shadow-sm">
        <h2 className="text-lg sm:text-xl font-semibold text-primary truncate max-w-[70%]">
          CLJ Registration Hub
        </h2>
        <SignOutButton />
      </header>
      <main className="flex-1 p-4 pb-16 sm:pb-4">
        <Content />
      </main>
      <Toaster />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "events" | "register" | "attendees" | "analytics"
  >("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const navigationTabs = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "events", label: "Events", icon: "🎉" },
    { id: "register", label: "Door Registration", icon: "🚪" },
    { id: "attendees", label: "All Attendees", icon: "👥" },
    { id: "analytics", label: "Analytics", icon: "📈" },
  ];

  return (
    <div className="max-w-7xl mx-auto w-full">
      <Authenticated>
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {loggedInUser?.name ?? "Administrator"}!
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Manage events and register attendees at the door
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Mobile menu button */}
          <div className="md:hidden mb-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-full flex justify-between items-center px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-700 hover:bg-gray-50 text-sm font-medium"
            >
              <span>
                {navigationTabs.find((tab) => tab.id === activeTab)?.label}
              </span>
              <svg
                className={`w-4 h-4 transform transition-transform ${mobileMenuOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </button>
          </div>

          {/* Sidebar Navigation - Hidden on mobile by default, shown when menu is open */}
          <div
            className={`md:w-64 flex-shrink-0 ${mobileMenuOpen ? "block" : "hidden"} md:block`}
          >
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-2">
              {navigationTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setMobileMenuOpen(false); // Close the mobile menu after selection
                  }}
                  className={`w-full flex items-center px-3 py-2.5 rounded-md text-left text-sm transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary-50 text-primary-600 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="mr-2.5 text-base">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content - Full width on mobile, takes remaining space on desktop */}
          <div className="flex-1 w-full">
            <div className="rounded-xl border border-gray-200 overflow-hidden">
              {activeTab === "dashboard" && <Dashboard />}
              {activeTab === "events" && <EventManagement />}
              {activeTab === "register" && <EventRegistration />}
              {activeTab === "attendees" && <AttendeeList />}
              {activeTab === "analytics" && <Analytics />}
            </div>
          </div>
        </div>
      </Authenticated>

      <Unauthenticated>
        <div className="w-full max-w-md mx-auto mt-8 sm:mt-20">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
              Event Registration Hub
            </h1>
            <p className="text-base sm:text-xl text-gray-600">
              Sign in to manage events and door registration
            </p>
          </div>
          <SignInForm />
        </div>
      </Unauthenticated>
    </div>
  );
}
