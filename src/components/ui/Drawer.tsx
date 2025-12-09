import { useEffect } from "react";

interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export function Drawer({ isOpen, onClose, title, children }: DrawerProps) {
    // Prevent body scroll when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
            <div className="absolute inset-0 overflow-hidden">
                {/* Background overlay */}
                <div
                    className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                    aria-hidden="true"
                    onClick={onClose}
                ></div>

                <div className="fixed inset-y-0 right-0 pl-0 sm:pl-10 max-w-full flex">
                    <div className="w-screen max-w-2xl transform transition ease-in-out duration-500 sm:duration-700 translate-x-0">
                        <div className="h-full flex flex-col bg-white shadow-xl overflow-y-scroll">
                            <div className="px-4 py-6 sm:px-6 border-b border-gray-200">
                                <div className="flex items-start justify-between">
                                    <h2 className="text-lg font-medium text-gray-900" id="slide-over-title">
                                        {title}
                                    </h2>
                                    <div className="ml-3 h-7 flex items-center">
                                        <button
                                            type="button"
                                            className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                            onClick={onClose}
                                        >
                                            <span className="sr-only">Close panel</span>
                                            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="relative flex-1 px-4 py-6 sm:px-6">
                                {children}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
