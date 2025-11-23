interface AttendeeSearchProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
    searchResults: any[] | undefined;
    onSelect: (attendee: any) => void;
}

export function AttendeeSearch({
    searchTerm,
    onSearchChange,
    searchResults,
    onSelect,
}: AttendeeSearchProps) {
    return (
        <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Existing Attendees
            </label>
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Type name to search..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />

            {searchResults && searchResults.length > 0 && (
                <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-sm">
                    {searchResults.map((attendee) => (
                        <button
                            key={attendee._id}
                            onClick={() => onSelect(attendee)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                            <div className="font-medium text-gray-900">{attendee.name}</div>
                            <div className="text-sm text-gray-500">
                                {attendee.placeOfResidence} • {attendee.phoneNumber}
                                <span
                                    className={`ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${attendee.isFirstTimeGuest
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
    );
}
