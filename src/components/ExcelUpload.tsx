import { useState, useRef, ChangeEvent } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import * as XLSX from "xlsx";
import { Button } from "./ui/Button";
import { InputField } from "./ui/InputField";
import { useToast } from "../hooks/use-toast";
import { SelectField } from "./ui/SelectField";
import { Layout } from "./ui/Layout";
import { JsonPreviewModal } from "./ui/JsonPreviewModal";

// Define the structure of Excel row data
interface ExcelRowData {
  name: string;
  phone?: string;
  location?: string;
  isFirstTimeGuest?: boolean;
}

export const ExcelUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rawJsonData, setRawJsonData] = useState<any[]>([]);
  const [parsedData, setParsedData] = useState<ExcelRowData[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [eventId, setEventId] = useState<string | "new" | null>(null); // Using string for SelectField compatibility
  const [newEvent, setNewEvent] = useState({
    name: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    maxCapacity: undefined as number | undefined,
  });
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [fieldMappings, setFieldMappings] = useState({
    name: "name",
    phone: "phone",
    location: "location",
    isFirstTimeGuest: "", // Default to empty string, meaning no mapping (defaults to returnee)
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Fetch all events for selection
  const events = useQuery(api.events.getAllEvents, { includeInactive: false });

  const processExcelMutation = useMutation(api.excelUpload.processExcelUpload);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
        toast({
          title: "Invalid file type",
          description: "Please upload an Excel file (.xlsx or .xls)",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      setFileName(file.name);

      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        // Get first worksheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert to JSON - store raw data for mapping
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        setRawJsonData(jsonData);

        // Show the mapping modal
        setShowMappingModal(true);
      };

      reader.onerror = () => {
        toast({
          title: "Error reading file",
          description: "There was an error reading the Excel file",
          variant: "destructive",
        });
      };

      reader.readAsArrayBuffer(file);
    }
  };

  // Process data with the selected field mappings
  // Process data with the current field mappings
  const processMappedData = () => {
    processMappedDataWithMappings(fieldMappings);
  };

  const handleProcess = () => {
    if (!parsedData || parsedData.length === 0) {
      toast({
        title: "No data to process",
        description: "Please upload an Excel file with valid data first",
        variant: "destructive",
      });
      return;
    }

    if (!eventId) {
      toast({
        title: "No event selected",
        description: "Please select an existing event or create a new one",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    // Prepare the request
    const request: any = {
      excelData: parsedData,
    };

    if (eventId === "new") {
      request.newEventDetails = newEvent;
    } else {
      // Convert string ID back to proper type
      request.eventId = eventId as Id<"events">;
    }

    processExcelMutation(request)
      .then((result: any) => {
        toast({
          title: "Upload successful!",
          description: `Created ${result.createdAttendees} new attendees, updated ${result.updatedAttendees} existing attendees, and registered ${result.registrations} for the event.`,
        });
        // Reset the form
        setSelectedFile(null);
        setParsedData([]);
        setFileName("");
        setEventId(null);
        setNewEvent({
          name: "",
          description: "",
          date: "",
          startTime: "",
          endTime: "",
          location: "",
          maxCapacity: undefined,
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      })
      .catch((error) => {
        toast({
          title: "Error processing Excel file",
          description: error.message || "An unexpected error occurred",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsProcessing(false);
      });
  };

  const handleMappingConfirm = (mappings: {
    name: string;
    phone: string;
    location: string;
    isFirstTimeGuest: string;
  }) => {
    // Update the mappings
    setFieldMappings(mappings);
    // Process with the new mappings immediately
    processMappedDataWithMappings(mappings);
    // Close the modal after processing
    setShowMappingModal(false);
  };
  
  // New function to process data with specific mappings
  const processMappedDataWithMappings = (mappings: {
    name: string;
    phone: string;
    location: string;
    isFirstTimeGuest: string;
  }) => {
    if (!rawJsonData.length) return;
    
    const processedData: ExcelRowData[] = rawJsonData.map((row: any) => {
      const name = row[mappings.name] ? String(row[mappings.name]) : "";
      const phone = row[mappings.phone] ? String(row[mappings.phone]) : undefined;
      const location = row[mappings.location] ? String(row[mappings.location]) : undefined;
      
      // Handle isFirstTimeGuest mapping - default to false (returnee) if no mapping or field not found
      let isFirstTimeGuest: boolean | undefined;
      if (mappings.isFirstTimeGuest) {
        const value = row[mappings.isFirstTimeGuest];
        if (value !== undefined && value !== null) {
          // Convert various possible values to boolean
          if (typeof value === 'boolean') {
            isFirstTimeGuest = value;
          } else if (typeof value === 'string') {
            const strValue = value.toLowerCase().trim();
            if (strValue === 'true' || strValue === 'yes' || strValue === '1' || strValue === 'y') {
              isFirstTimeGuest = true;
            } else if (strValue === 'false' || strValue === 'no' || strValue === '0' || strValue === 'n') {
              isFirstTimeGuest = false;
            }
          } else if (typeof value === 'number') {
            isFirstTimeGuest = Boolean(value);
          }
        }
      }
      
      // Default to false (returnee) if no mapping was provided
      if (mappings.isFirstTimeGuest === "") {
        isFirstTimeGuest = false;
      }
      
      return {
        name: name.trim(),
        phone: phone?.trim(),
        location: location?.trim(),
        isFirstTimeGuest,
      };
    });

    // Filter out rows without names
    const validData = processedData.filter(row => row.name && row.name.length > 0);
    
    setParsedData(validData);
    
    toast({
      title: "File processed successfully",
      description: `Found ${validData.length} valid records in the Excel file`,
    });
  };

  return (
    <Layout
      title="Upload Excel File for Event Registration"
      subtitle="Upload an Excel file containing user data to register them for an event"
    >
      <JsonPreviewModal
        isOpen={showMappingModal}
        onClose={() => setShowMappingModal(false)}
        jsonData={rawJsonData}
        onConfirm={handleMappingConfirm}
      />
      <div className="space-y-6">
        {/* File Upload Section */}
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

        {/* Manual Open Mapping Button */}
        {rawJsonData.length > 0 && (
          <div className="flex justify-center">
            <Button variant="outline" onClick={() => setShowMappingModal(true)}>
              Open Column Mapping
            </Button>
          </div>
        )}

        {/* Data Preview */}
        {parsedData.length > 0 && (
          <div className="rounded-md border">
            <div className="p-4 bg-gray-50 rounded-t-md border-b">
              <h3 className="font-medium">
                Preview of Parsed Data ({parsedData.length} records)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {parsedData.slice(0, 5).map((row, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {row.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {row.phone || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {row.location || "-"}
                      </td>
                    </tr>
                  ))}
                  {parsedData.length > 5 && (
                    <tr>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                        colSpan={3}
                      >
                        ... and {parsedData.length - 5} more records
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Event Selection or Creation */}
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

        {/* Process Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleProcess}
            disabled={
              !parsedData.length ||
              !eventId ||
              (isCreatingEvent && !newEvent.name) ||
              isProcessing
            }
            className="w-full md:w-auto"
            loading={isProcessing}
          >
            {`Register ${parsedData.length} Attendees`}
          </Button>
        </div>
      </div>
    </Layout>
  );
};
