import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

const TESTIMONY_CATEGORIES = [
    "Healing",
    "Development",
    "Miracle",
    "Job",
    "Salvation",
    "Finance",
    "Debt Cancellation",
    "Promotion",
    "Restoration",
    "Recovery of lost items",
    "Education",
    "House/Property",
    "Fruit of the womb"
];

export function TestimonyForm({ onSuccess }: { onSuccess?: () => void }) {
    const events = useQuery(api.events.getAllEvents, {});
    const submitTestimony = useMutation(api.testimonies.submitTestimony);

    const [formData, setFormData] = useState({
        name: "",
        phoneNumber: "",
        date: new Date().toISOString().split("T")[0],
        eventId: "" as string,
        categories: [] as string[],
        otherTestimony: "",
        otherTestimonyText: ""
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleCategoryChange = (category: string) => {
        setFormData(prev => {
            const newCategories = prev.categories.includes(category)
                ? prev.categories.filter(c => c !== category)
                : [...prev.categories, category];
            return { ...prev, categories: newCategories };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");
        setIsSubmitting(true);

        try {
            if (formData.categories.length === 0 && !formData.otherTestimonyText) {
                throw new Error("Please select at least one category or specify 'Other'");
            }

            await submitTestimony({
                name: formData.name,
                phoneNumber: formData.phoneNumber || undefined,
                date: formData.date,
                eventId: formData.eventId ? (formData.eventId as Id<"events">) : undefined,
                categories: formData.categories,
                otherTestimony: formData.otherTestimonyText || undefined,
            });

            setSuccessMessage("Testimony submitted successfully!");
            setFormData({
                name: "",
                phoneNumber: "",
                date: new Date().toISOString().split("T")[0],
                eventId: "",
                categories: [],
                otherTestimony: "",
                otherTestimonyText: ""
            });

            if (onSuccess) onSuccess();
        } catch (err: any) {
            setError(err.message || "Failed to submit testimony");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 border-b border-gray-100 pb-4">Submit New Testimony</h3>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {successMessage}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="input-field"
                            placeholder="Enter full name"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            className="input-field"
                            placeholder="e.g. 0712345678"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="input-field"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Associated Event (Optional)
                        </label>
                        <select
                            value={formData.eventId}
                            onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                            className="select-field"
                        >
                            <option value="">Select an event...</option>
                            {events?.map((event: any) => (
                                <option key={event._id} value={event._id}>
                                    {event.name} ({event.date})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        What kind of testimony do you have? (Tick as appropriate) <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {TESTIMONY_CATEGORIES.map((category) => (
                            <label key={category} className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all duration-200 ${formData.categories.includes(category)
                                    ? "bg-primary-50 border-primary-500 ring-1 ring-primary-500"
                                    : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                                }`}>
                                <input
                                    type="checkbox"
                                    checked={formData.categories.includes(category)}
                                    onChange={() => handleCategoryChange(category)}
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                />
                                <span className="text-sm text-gray-700 font-medium">{category}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Any other testimony? Kindly specify:
                    </label>
                    <textarea
                        value={formData.otherTestimonyText}
                        onChange={(e) => setFormData({ ...formData, otherTestimonyText: e.target.value })}
                        className="input-field min-h-[100px] resize-y"
                        placeholder="Describe your testimony here..."
                    />
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary min-w-[150px] flex justify-center items-center"
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </>
                        ) : "Submit Testimony"}
                    </button>
                </div>
            </form>
        </div>
    );
}
