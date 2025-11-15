import React from "react";
import { Modal } from "./Modal";

interface JsonPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  jsonData: any[];
  onConfirm: (mappings: { name: string; phone: string; location: string; isFirstTimeGuest: string }) => void;
}

export const JsonPreviewModal: React.FC<JsonPreviewModalProps> = ({ 
  isOpen, 
  onClose, 
  jsonData, 
  onConfirm 
}) => {
  const [mappings, setMappings] = React.useState({
    name: "name",
    phone: "phone",
    location: "location",
    isFirstTimeGuest: ""
  });
  
  const sampleData = jsonData.slice(0, 5); // Show first 5 rows as sample
  const availableFields = Array.from(
    new Set(jsonData.flatMap((row) => Object.keys(row)))
  );

  const handleConfirm = () => {
    onConfirm(mappings);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Map Excel Columns">
      <div className="space-y-6">
        <div>
          <h4 className="font-medium mb-2">Available Fields</h4>
          <div className="flex flex-wrap gap-2 mb-4">
            {availableFields.map((field) => (
              <span 
                key={field} 
                className="px-2 py-1 bg-gray-100 rounded text-sm"
              >
                {field}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name Field</label>
            <select
              value={mappings.name}
              onChange={(e) => setMappings({...mappings, name: e.target.value})}
              className="w-full p-2 border rounded"
            >
              <option value="">Select field...</option>
              {availableFields.map((field) => (
                <option key={field} value={field}>
                  {field}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Phone Field</label>
            <select
              value={mappings.phone}
              onChange={(e) => setMappings({...mappings, phone: e.target.value})}
              className="w-full p-2 border rounded"
            >
              <option value="">Select field...</option>
              {availableFields.map((field) => (
                <option key={field} value={field}>
                  {field}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Location Field</label>
            <select
              value={mappings.location}
              onChange={(e) => setMappings({...mappings, location: e.target.value})}
              className="w-full p-2 border rounded"
            >
              <option value="">Select field...</option>
              {availableFields.map((field) => (
                <option key={field} value={field}>
                  {field}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">First-time Guest Field</label>
            <select
              value={mappings.isFirstTimeGuest}
              onChange={(e) => setMappings({...mappings, isFirstTimeGuest: e.target.value})}
              className="w-full p-2 border rounded"
            >
              <option value="">Default to returnee</option>
              {availableFields.map((field) => (
                <option key={field} value={field}>
                  {field}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to default to returnee (false)
            </p>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Sample Data</h4>
          <div className="bg-gray-50 p-4 rounded max-h-60 overflow-auto">
            <pre className="text-xs">
              {JSON.stringify(sampleData, null, 2)}
            </pre>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!mappings.name || !mappings.phone}
            className={`px-4 py-2 rounded ${
              !mappings.name || !mappings.phone
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-primary-600 text-white hover:bg-primary-700"
            }`}
          >
            Confirm Mappings
          </button>
        </div>
      </div>
    </Modal>
  );
};