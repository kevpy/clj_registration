import { RefObject, ChangeEvent } from "react";

interface FileUploaderProps {
    fileInputRef: RefObject<HTMLInputElement | null>;
    handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
    fileName: string;
}

export function FileUploader({ fileInputRef, handleFileChange, fileName }: FileUploaderProps) {
    return (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".xlsx,.xls"
                className="hidden"
                id="excel-upload"
            />
            <div className="flex flex-col items-center justify-center gap-4">
                <div className="text-gray-400">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 mx-auto"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                    </svg>
                </div>
                <div>
                    <label
                        htmlFor="excel-upload"
                        className="cursor-pointer font-medium text-primary hover:underline"
                    >
                        {fileName ? fileName : "Click to upload Excel file"}
                    </label>
                    <p className="text-sm text-gray-500 mt-1">
                        Supports .xlsx and .xls files
                    </p>
                </div>
            </div>
        </div>
    );
}
