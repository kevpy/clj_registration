import { useState } from "react";
import { Id } from "../../../convex/_generated/dataModel";

interface TestimonyDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    testimony: any; // Using any for now to match the parent component's data structure
    onDelete?: (id: Id<"testimonies">) => void;
    canDelete?: boolean;
}

export function TestimonyDetailsModal({ isOpen, onClose, testimony, onDelete, canDelete }: TestimonyDetailsModalProps) {
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    const handlePrint = () => {
        const content = document.getElementById('testimony-details-content');
        if (!content) return;

        let printContainer = document.getElementById('print-container');
        if (!printContainer) {
            printContainer = document.createElement('div');
            printContainer.id = 'print-container';
            document.body.appendChild(printContainer);
        }

        printContainer.innerHTML = content.innerHTML;

        // Add class to body to trigger print styles
        document.body.classList.add('print-mode-modal');

        window.print();

        // Remove class after print
        document.body.classList.remove('print-mode-modal');

        // Remove the print container to clean up
        if (printContainer && printContainer.parentNode) {
            printContainer.parentNode.removeChild(printContainer);
        }
    };

    const handleDeleteClick = () => {
        setIsDeleteConfirmOpen(true);
    };

    const confirmDelete = () => {
        if (onDelete && testimony) {
            onDelete(testimony._id);
            setIsDeleteConfirmOpen(false);
        }
    };

    if (!isOpen || !testimony) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity print:hidden"
                    aria-hidden="true"
                    onClick={onClose}
                ></div>

                {/* Modal panel */}
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full relative">

                    {/* Close button - Top Right */}
                    <button
                        type="button"
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 focus:outline-none print:hidden"
                        onClick={onClose}
                    >
                        <span className="sr-only">Close</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <div id="testimony-details-content" className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 print-content-only">
                        <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6 border-b pb-2 pr-8" id="modal-title">
                                    Testimony Details
                                </h3>

                                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Date</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{testimony.date}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Name</dt>
                                        <dd className="mt-1 text-sm font-medium text-gray-900">{testimony.name}</dd>
                                    </div>

                                    {testimony.phoneNumber && (
                                        <div>
                                            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{testimony.phoneNumber}</dd>
                                        </div>
                                    )}

                                    {testimony.event && (
                                        <div>
                                            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Associated Event</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{testimony.event.name} ({testimony.event.date})</dd>
                                        </div>
                                    )}

                                    <div className="sm:col-span-2">
                                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Categories</dt>
                                        <dd className="flex flex-wrap gap-2">
                                            {testimony.categories.map((cat: string, idx: number) => (
                                                <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                                    {cat}
                                                </span>
                                            ))}
                                        </dd>
                                    </div>

                                    {testimony.otherTestimony && (
                                        <div className="sm:col-span-2">
                                            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Other Details</dt>
                                            <dd className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap border border-gray-200">
                                                {testimony.otherTestimony}
                                            </dd>
                                        </div>
                                    )}
                                </dl>

                                {/* Print-only footer */}
                                <div className="hidden print:block mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
                                    Printed from Event Registration Hub • {new Date().toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse print:hidden">
                        <button
                            type="button"
                            className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={handlePrint}
                        >
                            Print / Save PDF
                        </button>
                        {canDelete && onDelete && (
                            <button
                                type="button"
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                onClick={handleDeleteClick}
                            >
                                Delete
                            </button>
                        )}
                    </div>

                    {/* Delete Confirmation Modal Overlay */}
                    {isDeleteConfirmOpen && (
                        <div className="absolute inset-0 z-10 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 rounded-lg">
                            <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-2xl">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Confirm Delete</h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    Are you sure you want to delete this testimony? This action cannot be undone.
                                </p>
                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm"
                                        onClick={() => setIsDeleteConfirmOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
                                        onClick={confirmDelete}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
