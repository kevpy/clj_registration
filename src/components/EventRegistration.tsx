import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { EventSelector } from "./registration/EventSelector";
import { AttendeeSearch } from "./registration/AttendeeSearch";
import { RegistrationForm } from "./registration/RegistrationForm";
import { RecentAttendeesList } from "./registration/RecentAttendeesList";

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

      <EventSelector
        events={events}
        selectedEventId={selectedEventId}
        onSelect={setSelectedEventId}
      />

      {selectedEventId && (
        <>
          <AttendeeSearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchResults={searchResults}
            onSelect={handleAttendeeSelect}
          />

          <RegistrationForm
            formData={formData}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            existingAttendee={existingAttendee}
            selectedEventId={selectedEventId}
          />

          <RecentAttendeesList registrations={eventRegistrations || []} />
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
