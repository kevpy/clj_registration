interface DataPreviewProps {
    parsedData: any[];
}

export function DataPreview({ parsedData }: DataPreviewProps) {
    if (!parsedData || parsedData.length === 0) return null;

    return (
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
    );
}
