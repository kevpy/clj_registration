import { Id } from "../../../convex/_generated/dataModel";

interface EventSelectorProps {
    events: any[];
    selectedEventId: string;
    onSelect: (eventId: string) => void;
}

export function EventSelector({ events, selectedEventId, onSelect }: EventSelectorProps) {
    const selectedEvent = events.find((e) => e._id === selectedEventId);

    return (
        <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Event *
            </label>
            <select
                value={selectedEventId}
                onChange={(e) => onSelect(e.target.value)}
                className="select-field"
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
                <div className="mt-2 p-3 bg-primary-50 border border-primary-200 rounded-lg">
                    <h4 className="font-medium text-primary-900">{selectedEvent.name}</h4>
                    <p className="text-sm text-primary-700">
                        {new Date(selectedEvent.date).toLocaleDateString()}
                        {selectedEvent.startTime && ` at ${selectedEvent.startTime}`}
                        {selectedEvent.location && ` • ${selectedEvent.location}`}
                    </p>
                    {selectedEvent.description && (
                        <p className="text-sm text-primary-600 mt-1">
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
    );
}
