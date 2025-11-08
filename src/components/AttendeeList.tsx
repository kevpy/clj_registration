import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function AttendeeList() {
  const events = useQuery(api.events.getAllEvents, { includeInactive: false });
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterGuestType, setFilterGuestType] = useState("");
  const [showAttendedOnly, setShowAttendedOnly] = useState(false);

  const eventRegistrations = useQuery(
    api.registrations.getEventRegistrations,
    selectedEventId ? { 
      eventId: selectedEventId as any,
      attendedOnly: showAttendedOnly 
    } : "skip"
  );

  const filteredRegistrations = eventRegistrations?.filter(registration => {
    if (!registration.attendee) return false;
    
    const attendee = registration.attendee;
    const matchesSearch = attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attendee.placeOfResidence.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attendee.phoneNumber.includes(searchTerm);
    const matchesGender = !filterGender || attendee.gender === filterGender;
    const matchesGuestType = !filterGuestType || 
                            (filterGuestType === 'first-time' && attendee.isFirstTimeGuest) ||
                            (filterGuestType === 'returning' && !attendee.isFirstTimeGuest);
    
    return matchesSearch && matchesGender && matchesGuestType;
  });

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
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900">{selectedEvent.name}</h3>
            <p className="text-blue-700">
              {new Date(selectedEvent.date).toLocaleDateString()}
              {selectedEvent.startTime && ` at ${selectedEvent.startTime}`}
              {selectedEvent.location && ` • ${selectedEvent.location}`}
            </p>
            <div className="flex gap-4 mt-2 text-sm">
              <span className="text-blue-600">📝 {selectedEvent.registrationCount} registered</span>
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
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>

            <select
              value={filterGuestType}
              onChange={(e) => setFilterGuestType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
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
                        Location
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
                            {registration.attendee?.placeOfResidence}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {registration.attendee?.phoneNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                            {registration.attendee?.gender}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            registration.attendee?.isFirstTimeGuest 
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
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            registration.hasAttended 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {registration.hasAttended ? 'Yes' : 'No'}
                          </span>
                          {registration.hasAttended && registration.attendanceTime && (
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(registration.attendanceTime).toLocaleString()}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

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
    </div>
  );
}
