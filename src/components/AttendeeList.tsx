import { useState } from "react";
import { useQuery, useMutation, usePaginatedQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";
import { EditAttendeeModal } from "./EditAttendeeModal";

export function AttendeeList() {
  const events = useQuery(api.events.getAllEvents, { includeInactive: false });
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterGuestType, setFilterGuestType] = useState("");
  const [showAttendedOnly, setShowAttendedOnly] = useState(false);
  const [editingAttendee, setEditingAttendee] = useState<any>(null);

  const recordAttendance = useMutation(api.registrations.recordAttendance);

  const { results: eventRegistrations, status, loadMore } = usePaginatedQuery(
    api.registrations.getEventRegistrations,
    selectedEventId ? {
      eventId: selectedEventId as any,
      attendedOnly: showAttendedOnly,
      searchTerm: searchTerm.length >= 2 ? searchTerm : undefined,
    } : "skip",
    { initialNumItems: 10 }
  );

  const filteredRegistrations = eventRegistrations?.filter(registration => {
    if (!registration.attendee) return false;

    // Client-side filtering for other fields since search is now server-side (mostly)
    // or if search term is short, we might still want client side filtering?
    // Actually, if we use server side search, the results are already filtered by name.
    // But we still need to filter by gender/guest type on the client for the loaded page.

    const attendee = registration.attendee;
    // We only client-side filter search if we didn't send it to server (length < 2)
    const matchesSearch = searchTerm.length < 2 ? (
      attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendee.placeOfResidence?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendee.phoneNumber?.includes(searchTerm) || false
    ) : true;

    const matchesGender = !filterGender || attendee.gender === filterGender;
    const matchesGuestType = !filterGuestType ||
      (filterGuestType === 'first-time' && attendee.isFirstTimeGuest) ||
      (filterGuestType === 'returning' && !attendee.isFirstTimeGuest);

    return matchesSearch && matchesGender && matchesGuestType;
  });

  const handleCheckIn = async (attendeeId: Id<"attendees">, attendeeName: string) => {
    if (!selectedEventId) return;

    try {
      await recordAttendance({
        eventId: selectedEventId as Id<"events">,
        attendeeId,
      });
      toast.success(`Checked in ${attendeeName}`);
    } catch (error) {
      toast.error("Failed to check in attendee");
      console.error(error);
    }
  };

  if (!events) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-16 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const selectedEvent = events.find(e => e._id === selectedEventId);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Attendee Management</h2>
      </div>

      {/* Event Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Event
        </label>
        <select
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="select-field"
        >
          <option value="">All Events / Choose an event...</option>
          {events.map((event) => (
            <option key={event._id} value={event._id}>
              {event.name} - {new Date(event.date).toLocaleDateString()}
              ({event.registrationCount} registered, {event.attendedCount} attended)
            </option>
          ))}
        </select>
      </div>

      {selectedEventId && selectedEvent && (
        <>
          {/* Event Info */}
          <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
            <h3 className="font-semibold text-primary-900">{selectedEvent.name}</h3>
            <p className="text-primary-700">
              {new Date(selectedEvent.date).toLocaleDateString()}
              {selectedEvent.startTime && ` at ${selectedEvent.startTime}`}
              {selectedEvent.location && ` • ${selectedEvent.location}`}
            </p>
            <div className="flex gap-4 mt-2 text-sm">
              <span className="text-primary-600">📝 {selectedEvent.registrationCount} registered</span>
              <span className="text-green-600">✅ {selectedEvent.attendedCount} attended</span>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <input
              type="text"
              placeholder="Search attendees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />

            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="select-field"
            >
              <option value="">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>

            <select
              value={filterGuestType}
              onChange={(e) => setFilterGuestType(e.target.value)}
              className="select-field"
            >
              <option value="">All Guest Types</option>
              <option value="first-time">First-time Guests</option>
              <option value="returning">Returning Guests</option>
            </select>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="attendedOnly"
                checked={showAttendedOnly}
                onChange={(e) => setShowAttendedOnly(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="attendedOnly" className="ml-2 text-sm text-gray-700">
                Attended only
              </label>
            </div>

            <div className="text-sm text-gray-600 flex items-center">
              Showing {filteredRegistrations?.length || 0} of {eventRegistrations?.length || 0}
            </div>
          </div>

          {/* Attendees Table */}
          {eventRegistrations && (
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Residence
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gender
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Guest Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Attended
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRegistrations?.map((registration) => (
                      <tr key={registration._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {registration.attendee?.name}
                          </div>
                          {registration.attendee?.email && (
                            <div className="text-sm text-gray-500">
                              {registration.attendee.email}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {registration.attendee?.placeOfResidence || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {registration.attendee?.phoneNumber || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                            {registration.attendee?.gender}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${registration.attendee?.isFirstTimeGuest
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-green-100 text-green-800'
                            }`}>
                            {registration.attendee?.isFirstTimeGuest ? 'First-time' : 'Returning'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(registration.registrationDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {registration.hasAttended ? (
                            <div>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Yes
                              </span>
                              {registration.attendanceTime && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {new Date(registration.attendanceTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => handleCheckIn(registration.attendeeId, registration.attendee?.name || "")}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                              Check In
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => setEditingAttendee(registration.attendee)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {status === "CanLoadMore" && (
                <div className="p-4 text-center border-t border-gray-200">
                  <button
                    onClick={() => loadMore(10)}
                    className="px-4 py-2 text-sm text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-md transition-colors"
                  >
                    Load More
                  </button>
                </div>
              )}

              {filteredRegistrations?.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-500">
                    {eventRegistrations.length === 0
                      ? "No registrations for this event yet"
                      : "No attendees found matching your criteria"
                    }
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {!selectedEventId && (
        <div className="text-center py-12">
          <div className="text-gray-500">Select an event to view attendees</div>
        </div>
      )}

      {events.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">No events available</div>
          <p className="text-sm text-gray-400 mt-2">Create an event first to start managing attendees</p>
        </div>
      )}

      {editingAttendee && (
        <EditAttendeeModal
          isOpen={!!editingAttendee}
          onClose={() => setEditingAttendee(null)}
          attendee={editingAttendee}
        />
      )}
    </div>
  );
}
