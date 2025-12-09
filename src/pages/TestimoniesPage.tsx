
import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { TestimonyForm } from "../components/testimonies/TestimonyForm";
import { TestimonyDetailsModal } from "../components/testimonies/TestimonyDetailsModal";
import { Drawer } from "../components/ui/Drawer";
import { Id } from "../../convex/_generated/dataModel";

export default function TestimoniesPage() {
    const [selectedEventId, setSelectedEventId] = useState<string>("");
    const [filterYear, setFilterYear] = useState<string>(new Date().getFullYear().toString());
    const [filterMonth, setFilterMonth] = useState<string>("");
    const [selectedTestimony, setSelectedTestimony] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Testimonies</h2>
                    <p className="text-gray-600 mt-1">Record and manage testimonies from attendees</p>
                </div>
                <button
                    onClick={() => setIsDrawerOpen(true)}
                    className="btn-primary flex items-center"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Submit Testimony
                </button>
            </div>

            <div className="space-y-6">
                {/* Filters */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Year</label>
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
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Month</label>
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
                        <div className="flex-[2]">
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Event</label>
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

                {/* Testimonies Grid */}
                {filteredTestimonies?.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                        <div className="text-gray-500">No testimonies found matching your filters</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTestimonies?.map((testimony: any) => (
                            <div key={testimony._id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
                                <div className="p-5 flex-1">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{testimony.name}</h3>
                                            <p className="text-sm text-gray-500">{testimony.date}</p>
                                        </div>
                                        {testimony.phoneNumber && (
                                            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                                                {testimony.phoneNumber}
                                            </span>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {testimony.categories.slice(0, 3).map((cat: string, idx: number) => (
                                                <span key={idx} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                    {cat}
                                                </span>
                                            ))}
                                            {testimony.categories.length > 3 && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-600 border border-gray-100">
                                                    +{testimony.categories.length - 3}
                                                </span>
                                            )}
                                        </div>

                                        {testimony.otherTestimony && (
                                            <p className="text-sm text-gray-600 line-clamp-3">
                                                {testimony.otherTestimony}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 rounded-b-xl flex justify-between items-center">
                                    <div className="text-xs text-gray-500 truncate max-w-[60%]">
                                        {testimony.event ? (
                                            <span className="flex items-center">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5"></span>
                                                {testimony.event.name}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 italic">No event linked</span>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleViewDetails(testimony)}
                                            className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline"
                                        >
                                            View Details
                                        </button>
                                        {isAdmin && (
                                            <button
                                                onClick={() => handleDelete(testimony._id)}
                                                className="text-xs font-medium text-red-600 hover:text-red-700 hover:underline ml-2"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Drawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                title="Submit New Testimony"
            >
                <TestimonyForm />
            </Drawer>

            <TestimonyDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                testimony={selectedTestimony}
            />
        </div>
    );
}
