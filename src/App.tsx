import { Authenticated, Unauthenticated } from "convex/react";
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
      <Authenticated>
        <DashboardLayout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/attendees" element={<AttendeesPage />} />
            <Route path="/excel" element={<ExcelUploadPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
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
