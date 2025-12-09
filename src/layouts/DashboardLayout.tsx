import { ReactNode, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { SignOutButton } from "../SignOutButton";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface DashboardLayoutProps {
    children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const loggedInUser = useQuery(api.auth.loggedInUser);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    const navigationTabs = [
        { id: "dashboard", label: "Dashboard", icon: "📊", path: "/" },
        { id: "events", label: "Events", icon: "🎉", path: "/events" },
        { id: "register", label: "Door Registration", icon: "🚪", path: "/register" },
        { id: "attendees", label: "All Attendees", icon: "👥", path: "/attendees" },
        { id: "excel", label: "Excel Upload", icon: "📄", path: "/excel" },
        { id: "analytics", label: "Analytics", icon: "📈", path: "/analytics" },
        { id: "testimonies", label: "Testimonies", icon: "🙏", path: "/testimonies" },
    ];

    const currentTab = navigationTabs.find((tab) => tab.path === location.pathname) || navigationTabs[0];

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm h-16 flex justify-between items-center border-b border-gray-200 px-4 sm:px-6 shadow-sm">
                <h2 className="text-lg sm:text-xl font-semibold text-primary truncate max-w-[70%]">
                    CLJ Registration Hub
                </h2>
                <div className="flex items-center gap-4">
                    <span className="hidden sm:inline text-sm text-gray-600">
                        {loggedInUser?.name ?? "Administrator"}
                    </span>
                    <SignOutButton />
                </div>
            </header>

            <main className="flex-1 p-4 pb-16 sm:pb-4">
                <div className="max-w-7xl mx-auto w-full">
                    <div className="mb-6">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                            {currentTab.label}
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
                                <span>{currentTab.label}</span>
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

                        {/* Sidebar Navigation */}
                        <div
                            className={`md:w-64 flex-shrink-0 ${mobileMenuOpen ? "block" : "hidden"} md:block`}
                        >
                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-2">
                                {navigationTabs.map((tab) => (
                                    <NavLink
                                        key={tab.id}
                                        to={tab.path}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={({ isActive }) =>
                                            `w-full flex items-center px-3 py-2.5 rounded-md text-left text-sm transition-colors ${isActive
                                                ? "bg-primary-50 text-primary-600 font-medium"
                                                : "text-gray-700 hover:bg-gray-50"
                                            }`
                                        }
                                    >
                                        <span className="mr-2.5 text-base">{tab.icon}</span>
                                        <span>{tab.label}</span>
                                    </NavLink>
                                ))}
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 w-full">
                            <div className="rounded-xl border border-gray-200 overflow-hidden bg-white min-h-[500px]">
                                {children}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
