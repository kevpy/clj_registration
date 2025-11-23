import { SelectField } from "../ui/SelectField";
import { InputField } from "../ui/InputField";

interface EventSelectionProps {
    events: any[];
    eventId: string | "new" | null;
    setEventId: (id: string | "new" | null) => void;
    isCreatingEvent: boolean;
    setIsCreatingEvent: (isCreating: boolean) => void;
    newEvent: any;
    setNewEvent: (event: any) => void;
}

export function EventSelection({
    events,
    eventId,
    setEventId,
    isCreatingEvent,
    setIsCreatingEvent,
    newEvent,
    setNewEvent,
}: EventSelectionProps) {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Event Selection</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <SelectField
                        label="Select Existing Event"
                        value={eventId === null ? "" : eventId}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                            const value = e.target.value;
                            if (value === "new") {
                                setEventId("new");
                                setIsCreatingEvent(true);
                            } else if (value === "") {
                                setEventId(null);
                                setIsCreatingEvent(false);
                            } else {
                                setEventId(value);
                                setIsCreatingEvent(false);
                            }
                        }}
                    >
                        <option value="">Select an event or create new</option>
                        <option value="new">Create New Event</option>
                        {events &&
                            events.map((event: any) => (
                                <option key={event._id} value={event._id}>
                                    {event.name} - {event.date}
                                </option>
                            ))}
                    </SelectField>
                </div>

                {isCreatingEvent && (
                    <div className="space-y-2 p-4 border rounded-lg bg-gray-50">
                        <h4 className="font-medium">New Event Details</h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                label="Event Name *"
                                value={newEvent.name}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    setNewEvent({ ...newEvent, name: e.target.value })
                                }
                                placeholder="Enter event name"
                            />

                            <InputField
                                label="Date *"
                                type="date"
                                value={newEvent.date}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    setNewEvent({ ...newEvent, date: e.target.value })
                                }
                            />

                            <InputField
                                label="Location"
                                value={newEvent.location}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    setNewEvent({ ...newEvent, location: e.target.value })
                                }
                                placeholder="Enter location"
                            />

                            <InputField
                                label="Max Capacity"
                                type="number"
                                value={newEvent.maxCapacity || ""}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    setNewEvent({
                                        ...newEvent,
                                        maxCapacity: e.target.value
                                            ? Number(e.target.value)
                                            : undefined,
                                    })
                                }
                                placeholder="Enter max capacity"
                            />

                            <div className="md:col-span-2">
                                <InputField
                                    label="Description"
                                    value={newEvent.description}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setNewEvent({
                                            ...newEvent,
                                            description: e.target.value,
                                        })
                                    }
                                    placeholder="Enter description"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
