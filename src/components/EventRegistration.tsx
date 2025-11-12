import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function EventRegistration() {
  const events = useQuery(api.events.getAllEvents, { includeInactive: false });
  const registerAtDoor = useMutation(api.registrations.registerAttendeeAtDoor);

  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    placeOfResidence: "",
    phoneNumber: "",
    gender: "" as "male" | "female" | "other" | "",
    email: "",
    isFirstTimeGuest: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const searchResults = useQuery(
    api.registrations.searchAttendees,
    searchTerm.length >= 2 ? { searchTerm, limit: 5 } : "skip",
  );

  const existingAttendee = useQuery(
    api.registrations.getAttendeeByPhone,
    formData.phoneNumber.length >= 10
      ? { phoneNumber: formData.phoneNumber }
      : "skip",
  );

  const eventRegistrations = useQuery(
    api.registrations.getEventRegistrations,
    selectedEventId ? { eventId: selectedEventId as any } : "skip",
  );

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAttendeeSelect = (attendee: any) => {
    setFormData({
      name: attendee.name,
      placeOfResidence: attendee.placeOfResidence,
      phoneNumber: attendee.phoneNumber,
      gender: attendee.gender,
      email: attendee.email || "",
      isFirstTimeGuest: attendee.isFirstTimeGuest,
    });
    setSearchTerm("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEventId) {
      toast.error("Please select an event");
      return;
    }

    if (
      !formData.name ||
      !formData.placeOfResidence ||
      !formData.phoneNumber ||
      !formData.gender
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await registerAtDoor({
        eventId: selectedEventId as any,
        attendeeData: {
          name: formData.name,
          placeOfResidence: formData.placeOfResidence,
          phoneNumber: formData.phoneNumber,
          gender: formData.gender as "male" | "female",
          email: formData.email || undefined,
        },
        isFirstTimeGuest: formData.isFirstTimeGuest,
        useExistingAttendee: !!existingAttendee,
        existingAttendeeId: existingAttendee?._id,
      });

      toast.success("Attendee registered and checked in successfully!");
      setFormData({
        name: "",
        placeOfResidence: "",
        phoneNumber: "",
        gender: "",
        email: "",
        isFirstTimeGuest: true,
      });
      setSearchTerm("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Registration failed",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!events) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="bg-gray-200 h-8 w-48 rounded mb-4"></div>
          <div className="bg-gray-200 h-12 rounded"></div>
        </div>
      </div>
    );
  }

  const selectedEvent = events.find((e) => e._id === selectedEventId);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          Door Registration & Check-in
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          Register attendees as they arrive at the event
        </p>
      </div>

      {/* Event Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Event *
        </label>
        <select
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="">Choose an event...</option>
          {events.map((event) => (
            <option key={event._id} value={event._id}>
              {event.name} - {new Date(event.date).toLocaleDateString()}
              {event.startTime && ` at ${event.startTime}`}
              {event.maxCapacity &&
                ` (${event.attendedCount}/${event.maxCapacity} attended)`}
            </option>
          ))}
        </select>

        {selectedEvent && (
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900">{selectedEvent.name}</h4>
            <p className="text-sm text-blue-700">
              {new Date(selectedEvent.date).toLocaleDateString()}
              {selectedEvent.startTime && ` at ${selectedEvent.startTime}`}
              {selectedEvent.location && ` • ${selectedEvent.location}`}
            </p>
            {selectedEvent.description && (
              <p className="text-sm text-blue-600 mt-1">
                {selectedEvent.description}
              </p>
            )}
            <div className="flex gap-4 mt-2 text-sm">
              <span className="text-green-600">
                ✅ {selectedEvent.attendedCount} checked in
              </span>
              {selectedEvent.maxCapacity && (
                <span className="text-gray-600">
                  👥 Capacity: {selectedEvent.maxCapacity}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {selectedEventId && (
        <>
          {/* Attendee Search */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Existing Attendees
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type name to search..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />

            {searchResults && searchResults.length > 0 && (
              <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-sm">
                {searchResults.map((attendee) => (
                  <button
                    key={attendee._id}
                    onClick={() => handleAttendeeSelect(attendee)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">
                      {attendee.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {attendee.placeOfResidence} • {attendee.phoneNumber}
                      <span
                        className={`ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                          attendee.isFirstTimeGuest
                            ? "bg-orange-100 text-orange-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {attendee.isFirstTimeGuest ? "First-time" : "Returning"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
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
                  Place of Residence *
                </label>
                <input
                  type="text"
                  value={formData.placeOfResidence}
                  onChange={(e) =>
                    handleInputChange("placeOfResidence", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    handleInputChange("phoneNumber", e.target.value)
                  }
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    existingAttendee
                      ? "border-green-300 bg-green-50"
                      : "border-gray-300"
                  }`}
                  required
                />
                {existingAttendee && (
                  <p className="mt-1 text-sm text-green-600">
                    ✓ Found existing attendee: {existingAttendee.name}
                    <span
                      className={`ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                        existingAttendee.isFirstTimeGuest
                          ? "bg-orange-100 text-orange-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {existingAttendee.isFirstTimeGuest
                        ? "First-time"
                        : "Returning"}
                    </span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender *
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="firstTimeGuest"
                checked={formData.isFirstTimeGuest}
                onChange={(e) =>
                  handleInputChange("isFirstTimeGuest", e.target.checked)
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="firstTimeGuest"
                className="ml-2 block text-sm text-gray-900"
              >
                First-time guest (has never attended any event before)
              </label>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !selectedEventId}
                className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? "Processing..." : "Register & Check In"}
              </button>
            </div>
          </form>

          {/* Event Attendees List */}
          {eventRegistrations && (
            <div className="bg-gray-50 border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Event Attendees ({eventRegistrations.length})
              </h3>

              {eventRegistrations.length === 0 ? (
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
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {eventRegistrations.map((registration) => (
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
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                registration.attendee?.isFirstTimeGuest
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
                              ? new Date(
                                  registration.attendanceTime,
                                ).toLocaleTimeString()
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {events.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">No active events available</div>
          <p className="text-sm text-gray-400 mt-2">
            Create an event first to start registering attendees
          </p>
        </div>
      )}
    </div>
  );
}
