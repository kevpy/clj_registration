interface RegistrationFormProps {
    formData: {
        name: string;
        placeOfResidence: string;
        phoneNumber: string;
        gender: "male" | "female" | "other" | "";
        email: string;
        isFirstTimeGuest: boolean;
    };
    onChange: (field: string, value: string | boolean) => void;
    onSubmit: (e: React.FormEvent) => void;
    isSubmitting: boolean;
    existingAttendee: any;
    selectedEventId: string;
}

export function RegistrationForm({
    formData,
    onChange,
    onSubmit,
    isSubmitting,
    existingAttendee,
    selectedEventId,
}: RegistrationFormProps) {
    return (
        <form onSubmit={onSubmit} className="space-y-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => onChange("name", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Residence (Optional)
                    </label>
                    <input
                        type="text"
                        value={formData.placeOfResidence}
                        onChange={(e) => onChange("placeOfResidence", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                    </label>
                    <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => onChange("phoneNumber", e.target.value)}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${existingAttendee ? "border-green-300 bg-green-50" : "border-gray-300"
                            }`}
                    />
                    {existingAttendee && (
                        <p className="mt-1 text-sm text-green-600">
                            ✓ Found existing attendee: {existingAttendee.name}
                            <span
                                className={`ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${existingAttendee.isFirstTimeGuest
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-green-100 text-green-800"
                                    }`}
                            >
                                {existingAttendee.isFirstTimeGuest ? "First-time" : "Returning"}
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
                        onChange={(e) => onChange("gender", e.target.value)}
                        className="select-field"
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
                        onChange={(e) => onChange("email", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>
            </div>

            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="firstTimeGuest"
                    checked={formData.isFirstTimeGuest}
                    onChange={(e) => onChange("isFirstTimeGuest", e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="firstTimeGuest" className="ml-2 block text-sm text-gray-900">
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
    );
}
