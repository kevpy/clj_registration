import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface EventListProps {
    events: any[];
    selectedEvent: string | null;
    onSelectEvent: (eventId: string | null) => void;
    onToggleStatus: (eventId: string, currentStatus: boolean) => void;
}

export function EventList({
    events,
    selectedEvent,
    onSelectEvent,
    onToggleStatus,
}: EventListProps) {
    // We need to fetch details for the selected event here or pass it down.
    // The original component fetched it inside the loop which is not ideal if we extract it.
    // Better to have a separate component for EventDetails or fetch it in the parent.
    // However, the original code had:
    // const eventDetails = useQuery(api.events.getEventById, selectedEvent ? { eventId: selectedEvent as any } : "skip");
    // This hook needs to be at the top level of the component using it.

    // Let's create an EventItem component that handles the details fetching if selected.

    return (
        <div className="space-y-4">
            {events.map((event) => (
                <EventItem
                    key={event._id}
                    event={event}
                    isSelected={selectedEvent === event._id}
                    onSelect={() => onSelectEvent(selectedEvent === event._id ? null : event._id)}
                    onToggleStatus={() => onToggleStatus(event._id, event.isActive)}
                />
            ))}
        </div>
    );
}

function EventItem({
    event,
    isSelected,
    onSelect,
    onToggleStatus,
}: {
    event: any;
    isSelected: boolean;
    onSelect: () => void;
    onToggleStatus: () => void;
}) {
    const eventDetails = useQuery(
        api.events.getEventById,
        isSelected ? { eventId: event._id } : "skip"
    );

    return (
        <div className="bg-white border rounded-lg p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${event.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                            {event.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2 text-sm text-gray-600 mb-2">
                        <div>
                            <span className="font-medium">Date:</span> {new Date(event.date).toLocaleDateString()}
                        </div>
                        {event.startTime && (
                            <div>
                                <span className="font-medium">Time:</span> {event.startTime}
                                {event.endTime && ` - ${event.endTime}`}
                            </div>
                        )}
                        {event.location && (
                            <div>
                                <span className="font-medium">Location:</span> {event.location}
                            </div>
                        )}
                    </div>

                    {event.description && (
                        <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                    )}

                    <div className="flex flex-wrap gap-3 text-xs sm:text-sm">
                        <span className="text-green-600 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            {event.attendedCount} checked in
                        </span>
                        {event.maxCapacity && (
                            <span className="text-gray-600 flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                </svg>
                                Max: {event.maxCapacity}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex flex-shrink-0 gap-2 self-start">
                    <button
                        onClick={onSelect}
                        className="px-3 py-1.5 text-xs sm:text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex-1 min-w-[80px]"
                    >
                        {isSelected ? 'Hide Details' : 'View Details'}
                    </button>
                    <button
                        onClick={onToggleStatus}
                        className={`px-3 py-1.5 text-xs sm:text-sm border rounded-md transition-colors flex-1 min-w-[80px] ${event.isActive
                                ? 'text-red-600 border-red-600 hover:bg-red-50'
                                : 'text-green-600 border-green-600 hover:bg-green-50'
                            }`}
                    >
                        {event.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                </div>
            </div>

            {/* Event Details */}
            {isSelected && eventDetails && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Checked-in Attendees</h4>
                    {eventDetails.registrations.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No attendees checked in yet</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Check-in Time</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {eventDetails.registrations.map((registration) => (
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
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${registration.attendee?.isFirstTimeGuest
                                                        ? 'bg-orange-100 text-orange-800'
                                                        : 'bg-green-100 text-green-800'
                                                    }`}>
                                                    {registration.attendee?.isFirstTimeGuest ? 'First-time' : 'Returning'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-500">
                                                {registration.attendanceTime
                                                    ? new Date(registration.attendanceTime).toLocaleTimeString()
                                                    : '-'
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
