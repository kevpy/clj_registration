import { Id } from "../../../convex/_generated/dataModel";

interface TestimonyDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    testimony: any; // Using any for now to match the parent component's data structure
}

export function TestimonyDetailsModal({ isOpen, onClose, testimony }: TestimonyDetailsModalProps) {
    if (!isOpen || !testimony) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                    aria-hidden="true"
                    onClick={onClose}
                ></div>

                {/* Modal panel */}
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">
                                    Testimony Details
                                </h3>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Date</label>
                                            <p className="mt-1 text-sm text-gray-900">{testimony.date}</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Name</label>
                                            <p className="mt-1 text-sm font-medium text-gray-900">{testimony.name}</p>
                                        </div>
                                    </div>

                                    {testimony.phoneNumber && (
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</label>
                                            <p className="mt-1 text-sm text-gray-900">{testimony.phoneNumber}</p>
                                        </div>
                                    )}

                                    {testimony.event && (
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Associated Event</label>
                                            <p className="mt-1 text-sm text-gray-900">{testimony.event.name} ({testimony.event.date})</p>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Categories</label>
                                        <div className="flex flex-wrap gap-2">
                                            {testimony.categories.map((cat: string, idx: number) => (
                                                <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {cat}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {testimony.otherTestimony && (
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Other Details</label>
                                            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap">
                                                {testimony.otherTestimony}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
