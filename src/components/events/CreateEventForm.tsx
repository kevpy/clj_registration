interface CreateEventFormProps {
    formData: {
        name: string;
        description: string;
        date: string;
        startTime: string;
        endTime: string;
        location: string;
        maxCapacity: string;
    };
    onChange: (field: string, value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
}

export function CreateEventForm({
    formData,
    onChange,
    onSubmit,
    onCancel,
}: CreateEventFormProps) {
    return (
        <div className="mb-6 bg-gray-50 border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Event</h3>
            <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="eventName" className="block text-sm font-medium text-gray-700 mb-2">
                            Event Name *
                        </label>
                        <input
                            id="eventName"
                            type="text"
                            value={formData.name}
                            onChange={(e) => onChange("name", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-2">
                            Date *
                        </label>
                        <input
                            id="eventDate"
                            type="date"
                            value={formData.date}
                            onChange={(e) => onChange("date", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                            Start Time
                        </label>
                        <input
                            id="startTime"
                            type="time"
                            value={formData.startTime}
                            onChange={(e) => onChange("startTime", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                            End Time
                        </label>
                        <input
                            id="endTime"
                            type="time"
                            value={formData.endTime}
                            onChange={(e) => onChange("endTime", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                            Location
                        </label>
                        <input
                            id="location"
                            type="text"
                            value={formData.location}
                            onChange={(e) => onChange("location", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="maxCapacity" className="block text-sm font-medium text-gray-700 mb-2">
                            Max Capacity
                        </label>
                        <input
                            id="maxCapacity"
                            type="number"
                            value={formData.maxCapacity}
                            onChange={(e) => onChange("maxCapacity", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            min="1"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                    </label>
                    <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => onChange("description", e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
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
    );
}
