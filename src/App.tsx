import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
// import { useQuery } from "convex/react";
import { SignInForm } from "./SignInForm";
import { Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "./layouts/DashboardLayout";
import DashboardPage from "./pages/DashboardPage";
import EventsPage from "./pages/EventsPage";
import RegistrationPage from "./pages/RegistrationPage";
import AttendeesPage from "./pages/AttendeesPage";
import ExcelUploadPage from "./pages/ExcelUploadPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import TestimoniesPage from "./pages/TestimoniesPage";

import SharedReportPage from "./pages/SharedReportPage";

export default function App() {
  return (
    <Routes>
      <Route path="/shared-report/:token" element={<SharedReportPage />} />
      <Route path="*" element={<MainApp />} />
    </Routes>
  );
}

function MainApp() {
  return (
    <>
      <AuthLoading>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <svg className="animate-spin h-10 w-10 text-primary-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </AuthLoading>

      <Authenticated>
        <DashboardLayout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/attendees" element={<AttendeesPage />} />
            <Route path="/excel" element={<ExcelUploadPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/testimonies" element={<TestimoniesPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DashboardLayout>
      </Authenticated>

      <Unauthenticated>
        <div className="min-h-screen flex flex-col bg-gray-50 justify-center items-center p-4">
          <div className="w-full max-w-md mx-auto">
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
        </div>
      </Unauthenticated>
    </>
  );
}
