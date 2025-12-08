
import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { TestimonyForm } from "../components/testimonies/TestimonyForm";
import { TestimonyDetailsModal } from "../components/testimonies/TestimonyDetailsModal";
import { Id } from "../../convex/_generated/dataModel";

export default function TestimoniesPage() {
    const [selectedEventId, setSelectedEventId] = useState<string>("");
    const [filterYear, setFilterYear] = useState<string>(new Date().getFullYear().toString());
    const [filterMonth, setFilterMonth] = useState<string>("");
    const [selectedTestimony, setSelectedTestimony] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Pagination options - simplified for now, just getting first page
    const testimonies = useQuery(api.testimonies.getTestimonies, {
        paginationOpts: { numItems: 50, cursor: null }
    });

    const events = useQuery(api.events.getAllEvents, {});
    const deleteTestimony = useMutation(api.testimonies.deleteTestimony);
    const loggedInUser = useQuery(api.auth.loggedInUser);
    const isAdmin = loggedInUser?.role === "admin";

    const handleDelete = async (id: Id<"testimonies">) => {
        if (confirm("Are you sure you want to delete this testimony?")) {
            await deleteTestimony({ testimonyId: id });
        }
    };

    const handleViewDetails = (testimony: any) => {
        setSelectedTestimony(testimony);
        setIsModalOpen(true);
    };

    // Generate year options (current year back 5 years)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 6 }, (_, i) => (currentYear - i).toString());

    const months = [
        { value: "01", label: "January" },
        { value: "02", label: "February" },
        { value: "03", label: "March" },
        { value: "04", label: "April" },
        { value: "05", label: "May" },
        { value: "06", label: "June" },
        { value: "07", label: "July" },
        { value: "08", label: "August" },
        { value: "09", label: "September" },
        { value: "10", label: "October" },
        { value: "11", label: "November" },
        { value: "12", label: "December" },
    ];

    const filteredTestimonies = useMemo(() => {
        if (!testimonies?.page) return [];

        return testimonies.page.filter((t: any) => {
            // Event filter
            if (selectedEventId && t.eventId !== selectedEventId) return false;

            // Date parsing (YYYY-MM-DD)
            const [tYear, tMonth] = t.date.split("-");

            // Year filter
            if (filterYear && tYear !== filterYear) return false;

            // Month filter
            if (filterMonth && tMonth !== filterMonth) return false;

            return true;
        });
    }, [testimonies, selectedEventId, filterYear, filterMonth]);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Testimonies</h2>
                    <p className="text-gray-600 mt-1">Record and manage testimonies from attendees</p>
                </div>
            </div>

            <div className="mb-8">
                <TestimonyForm />
            </div>

            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3 className="text-xl font-semibold text-gray-900">Recent Testimonies</h3>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                        <div className="w-32">
                            <select
                                value={filterYear}
                                onChange={(e) => setFilterYear(e.target.value)}
                                className="select-field py-2 text-sm"
                            >
                                <option value="">All Years</option>
                                {years.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                        <div className="w-40">
                            <select
                                value={filterMonth}
                                onChange={(e) => setFilterMonth(e.target.value)}
                                className="select-field py-2 text-sm"
                            >
                                <option value="">All Months</option>
                                {months.map(month => (
                                    <option key={month.value} value={month.value}>{month.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="w-48">
                            <select
                                value={selectedEventId}
                                onChange={(e) => setSelectedEventId(e.target.value)}
                                className="select-field py-2 text-sm"
                            >
                                <option value="">All Events</option>
                                {events?.map((event: any) => (
                                    <option key={event._id} value={event._id}>{event.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categories</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Other Details</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredTestimonies?.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            No testimonies found matching your filters
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTestimonies?.map((testimony: any) => (
                                        <tr key={testimony._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {testimony.date}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{testimony.name}</div>
                                                {testimony.phoneNumber && (
                                                    <div className="text-sm text-gray-500">{testimony.phoneNumber}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {testimony.categories.slice(0, 2).map((cat: string, idx: number) => (
                                                        <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            {cat}
                                                        </span>
                                                    ))}
                                                    {testimony.categories.length > 2 && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                            +{testimony.categories.length - 2} more
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {testimony.event ? testimony.event.name : "-"}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                                                <div className="truncate w-48" title={testimony.otherTestimony}>
                                                    {testimony.otherTestimony || "-"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-3">
                                                    <button
                                                        onClick={() => handleViewDetails(testimony)}
                                                        className="text-primary-600 hover:text-primary-900 transition-colors"
                                                    >
                                                        View
                                                    </button>
                                                    {isAdmin && (
                                                        <button
                                                            onClick={() => handleDelete(testimony._id)}
                                                            className="text-red-600 hover:text-red-900 transition-colors"
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <TestimonyDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                testimony={selectedTestimony}
            />
        </div>
    );
}
