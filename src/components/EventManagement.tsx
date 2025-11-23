import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { CreateEventForm } from "./events/CreateEventForm";
import { EventList } from "./events/EventList";

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
        <CreateEventForm
          formData={formData}
          onChange={handleInputChange}
          onSubmit={handleCreateEvent}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Events List */}
      <EventList
        events={events}
        selectedEvent={selectedEvent}
        onSelectEvent={setSelectedEvent}
        onToggleStatus={handleToggleEventStatus}
      />

      {events.length === 0 && !showCreateForm && (
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
  );
}
