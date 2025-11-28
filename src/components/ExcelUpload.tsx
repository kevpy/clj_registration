import { useState, useRef, ChangeEvent } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import * as XLSX from "xlsx";
import { Button } from "./ui/Button";
import { useToast } from "../hooks/use-toast";
import { Layout } from "./ui/Layout";
import { JsonPreviewModal } from "./ui/JsonPreviewModal";
import { FileUploader } from "./excel/FileUploader";
import { DataPreview } from "./excel/DataPreview";
import { EventSelection } from "./excel/EventSelection";

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
        <FileUploader
          fileInputRef={fileInputRef}
          handleFileChange={handleFileChange}
          fileName={fileName}
        />

        {/* Manual Open Mapping Button */}
        {rawJsonData.length > 0 && (
          <div className="flex justify-center">
            <Button variant="outline" onClick={() => setShowMappingModal(true)}>
              Open Column Mapping
            </Button>
          </div>
        )}

        {/* Data Preview */}
        <DataPreview parsedData={parsedData} />

        {/* Event Selection or Creation */}
        <EventSelection
          events={events || []}
          eventId={eventId}
          setEventId={setEventId}
          isCreatingEvent={isCreatingEvent}
          setIsCreatingEvent={setIsCreatingEvent}
          newEvent={newEvent}
          setNewEvent={setNewEvent}
        />

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
