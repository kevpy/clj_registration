interface RecentAttendeesListProps {
    registrations: any[];
    loadMore: (numItems: number) => void;
    status: "CanLoadMore" | "LoadingMore" | "Exhausted" | "LoadingFirstPage";
    onEdit: (attendee: any) => void;
}

export function RecentAttendeesList({ registrations, loadMore, status, onEdit }: RecentAttendeesListProps) {
    if (!registrations) return null;

    return (
        <div className="bg-gray-50 border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Event Attendees ({registrations.length})
            </h3>

            {registrations.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                    No attendees checked in yet
                </p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Name
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Phone
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Location
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Status
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Check-in Time
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {registrations.map((registration) => (
                                <tr key={registration._id}>
                                    <td className="px-4 py-2 text-sm text-gray-900">
                                        {registration.attendee?.name}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-900">
                                        {registration.attendee?.phoneNumber}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-900">
                                        {registration.attendee?.placeOfResidence}
                                    </td>
                                    <td className="px-4 py-2">
                                        <span
                                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${registration.attendee?.isFirstTimeGuest
                                                ? "bg-orange-100 text-orange-800"
                                                : "bg-green-100 text-green-800"
                                                }`}
                                        >
                                            {registration.attendee?.isFirstTimeGuest
                                                ? "First-time"
                                                : "Returning"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-500">
                                        {registration.attendanceTime
                                            ? new Date(registration.attendanceTime).toLocaleTimeString()
                                            : "-"}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-500">
                                        <button
                                            onClick={() => onEdit(registration.attendee)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {status === "CanLoadMore" && (
                <div className="mt-4 text-center">
                    <button
                        onClick={() => loadMore(10)}
                        className="px-4 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                    >
                        Load More
                    </button>
                </div>
            )}
        </div>
    );
}
