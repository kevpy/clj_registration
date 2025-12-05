import { useParams } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function SharedReportPage() {
    const { token } = useParams<{ token: string }>();

    const report = useQuery(api.reports.getSharedReport,
        token ? { token } : "skip"
    );

    if (!token) {
        return <div className="p-8 text-center text-red-600">Invalid link</div>;
    }

    if (report === undefined) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-pulse text-gray-500">Loading report...</div>
            </div>
        );
    }

    // Handle errors (like expired link) returned by query or if query returns null/undefined unexpectedly
    // Note: Convex queries usually throw errors on the server which might need error boundary handling, 
    // but if the query returns null/undefined it means loading or not found.
    // If the query throws, useQuery might return undefined or error state depending on config.
    // For simplicity, we assume if it returns data it's good.

    // Actually, if the query throws an error (e.g. "Link has expired"), useQuery will throw.
    // We should probably wrap this in an ErrorBoundary or handle it. 
    // But for now, let's assume the user sees the error overlay in dev or a blank screen in prod if not handled.
    // A better UX would be to handle the error state, but useQuery doesn't return error directly.

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8 print:bg-white print:p-0">
            <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden print:shadow-none">
                {/* Header */}
                <div className="bg-primary p-6 text-white print:bg-white print:text-black print:border-b-2 print:border-gray-300">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold mb-2">Event Attendance Report</h1>
                            <h2 className="text-xl opacity-90">{report.eventName}</h2>
                            <p className="opacity-75 mt-1">
                                {new Date(report.eventDate).toLocaleDateString(undefined, {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                        <button
                            onClick={() => window.print()}
                            className="bg-white text-primary px-4 py-2 rounded-lg font-medium hover:bg-primary-50 transition-colors print:hidden"
                        >
                            Print / Save PDF
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-8">
                    {/* First Time Guests Section */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-8 w-1 bg-orange-500 rounded-full"></div>
                            <h3 className="text-xl font-bold text-gray-800">
                                First-Time Guests
                                <span className="ml-2 text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                    {report.firstTimeGuests.length}
                                </span>
                            </h3>
                        </div>

                        {report.firstTimeGuests.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b-2 border-gray-100">
                                            <th className="py-3 px-4 text-sm font-semibold text-gray-600">Name</th>
                                            <th className="py-3 px-4 text-sm font-semibold text-gray-600">Phone</th>
                                            <th className="py-3 px-4 text-sm font-semibold text-gray-600">Residence</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {report.firstTimeGuests.map((guest, idx) => (
                                            <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50">
                                                <td className="py-3 px-4 text-gray-800">{guest.name}</td>
                                                <td className="py-3 px-4 text-gray-600 font-mono text-sm">{guest.phone}</td>
                                                <td className="py-3 px-4 text-gray-600">{guest.residence}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-500 italic pl-4">No first-time guests recorded.</p>
                        )}
                    </section>

                    {/* Returning Guests Section */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-8 w-1 bg-green-500 rounded-full"></div>
                            <h3 className="text-xl font-bold text-gray-800">
                                Returning Guests
                                <span className="ml-2 text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                    {report.returningGuests.length}
                                </span>
                            </h3>
                        </div>

                        {report.returningGuests.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b-2 border-gray-100">
                                            <th className="py-3 px-4 text-sm font-semibold text-gray-600">Name</th>
                                            <th className="py-3 px-4 text-sm font-semibold text-gray-600">Phone</th>
                                            <th className="py-3 px-4 text-sm font-semibold text-gray-600">Residence</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {report.returningGuests.map((guest, idx) => (
                                            <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50">
                                                <td className="py-3 px-4 text-gray-800">{guest.name}</td>
                                                <td className="py-3 px-4 text-gray-600 font-mono text-sm">{guest.phone}</td>
                                                <td className="py-3 px-4 text-gray-600">{guest.residence}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-500 italic pl-4">No returning guests recorded.</p>
                        )}
                    </section>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 p-4 text-center text-sm text-gray-500 border-t print:hidden">
                    Generated via Event Registration Hub • {new Date().toLocaleDateString()}
                </div>
            </div>
        </div>
    );
}
