import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function EventManagement() {
  const events = useQuery(api.events.getAllEvents, { includeInactive: true });
  const createEvent = useMutation(api.events.createEvent);
  const updateEvent = useMutation(api.events.updateEvent);
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    maxCapacity: "",
  });

  const eventDetails = useQuery(
    api.events.getEventById,
    selectedEvent ? { eventId: selectedEvent as any } : "skip"
  );

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.date) {
      toast.error("Please fill in required fields (name and date)");
      return;
    }

    try {
      await createEvent({
        name: formData.name,
        description: formData.description || undefined,
        date: formData.date,
        startTime: formData.startTime || undefined,
        endTime: formData.endTime || undefined,
        location: formData.location || undefined,
        maxCapacity: formData.maxCapacity ? Number(formData.maxCapacity) : undefined,
      });
      
      toast.success("Event created successfully!");
      setFormData({
        name: "",
        description: "",
        date: "",
        startTime: "",
        endTime: "",
        location: "",
        maxCapacity: "",
      });
      setShowCreateForm(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create event");
    }
  };

  const handleToggleEventStatus = async (eventId: string, currentStatus: boolean) => {
    try {
      await updateEvent({
        eventId: eventId as any,
        isActive: !currentStatus,
      });
      toast.success(`Event ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update event");
    }
  };

  if (!events) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Event Management</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 text-sm bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          Create New Event
        </button>
      </div>

      {/* Create Event Form */}
      {showCreateForm && (
        <div className="mb-6 bg-gray-50 border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Event</h3>
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange("startTime", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange("endTime", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Capacity
                </label>
                <input
                  type="number"
                  value={formData.maxCapacity}
                  onChange={(e) => handleInputChange("maxCapacity", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Event
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Events List */}
      <div className="space-y-4">
        {events.map((event) => (
          <div key={event._id} className="bg-white border rounded-lg p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    event.isActive 
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
                  onClick={() => setSelectedEvent(selectedEvent === event._id ? null : event._id)}
                  className="px-3 py-1.5 text-xs sm:text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex-1 min-w-[80px]"
                >
                  {selectedEvent === event._id ? 'Hide Details' : 'View Details'}
                </button>
                <button
                  onClick={() => handleToggleEventStatus(event._id, event.isActive)}
                  className={`px-3 py-1.5 text-xs sm:text-sm border rounded-md transition-colors flex-1 min-w-[80px] ${
                    event.isActive
                      ? 'text-red-600 border-red-600 hover:bg-red-50'
                      : 'text-green-600 border-green-600 hover:bg-green-50'
                  }`}
                >
                  {event.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>

            {/* Event Details */}
            {selectedEvent === event._id && eventDetails && (
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
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                registration.attendee?.isFirstTimeGuest 
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
        ))}

        {events.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">No events created yet</div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Create Your First Event
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
