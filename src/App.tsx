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
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
        <h2 className="text-xl font-semibold text-primary">CLJ Registration Hub</h2>
        <SignOutButton />
      </header>
      <main className="flex-1 p-4">
        <Content />
      </main>
      <Toaster />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'events' | 'register' | 'attendees' | 'analytics'>('dashboard');

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Authenticated>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {loggedInUser?.name ?? "Administrator"}!
          </h1>
          <p className="text-gray-600">Manage events and register attendees at the door</p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'events', label: 'Events', icon: '🎉' },
              { id: 'register', label: 'Door Registration', icon: '🚪' },
              { id: 'attendees', label: 'All Attendees', icon: '👥' },
              { id: 'analytics', label: 'Analytics', icon: '📈' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'events' && <EventManagement />}
          {activeTab === 'register' && <EventRegistration />}
          {activeTab === 'attendees' && <AttendeeList />}
          {activeTab === 'analytics' && <Analytics />}
        </div>
      </Authenticated>

      <Unauthenticated>
        <div className="max-w-md mx-auto mt-20">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Event Registration Hub</h1>
            <p className="text-xl text-gray-600">Sign in to manage events and door registration</p>
          </div>
          <SignInForm />
        </div>
      </Unauthenticated>
    </div>
  );
}
