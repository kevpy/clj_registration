import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function Analytics() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedEventId, setSelectedEventId] = useState<string>("");

  const events = useQuery(api.events.getAllEvents, { includeInactive: true });
  const monthlyStats = useQuery(api.analytics.getMonthlyEventStats, {
    year: selectedYear,
    month: selectedMonth,
  });
  const eventAnalytics = useQuery(
    api.analytics.getEventAnalytics,
    selectedEventId ? { eventId: selectedEventId as any } : "skip"
  );

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  if (!events || !monthlyStats) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-200 h-64 rounded-lg"></div>
            <div className="bg-gray-200 h-64 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Analytics & Reports</h2>

        {/* Date Selector */}
        <div className="flex gap-4">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {months.map((month, index) => (
              <option key={month} value={index + 1}>
                {month}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Events</h3>
          <p className="text-3xl font-bold text-blue-600">{monthlyStats.totalEvents}</p>
          <p className="text-sm text-gray-500">This month</p>
        </div>

        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Registrations</h3>
          <p className="text-3xl font-bold text-green-600">{monthlyStats.totalRegistrations}</p>
          <p className="text-sm text-gray-500">This month</p>
        </div>

        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Attendance</h3>
          <p className="text-3xl font-bold text-purple-600">{monthlyStats.totalAttendance}</p>
          <p className="text-sm text-gray-500">This month</p>
        </div>

        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Attendance Rate</h3>
          <p className="text-3xl font-bold text-orange-600">{monthlyStats.averageAttendanceRate}%</p>
          <p className="text-sm text-gray-500">Average</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Events Calendar */}
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Events Calendar - {months[selectedMonth - 1]} {selectedYear}
          </h3>

          {Object.keys(monthlyStats.eventsByDate).length === 0 ? (
            <p className="text-gray-500 text-center py-8">No events this month</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(monthlyStats.eventsByDate)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([date, count]) => (
                  <div key={date} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">
                      {new Date(date).toLocaleDateString()}
                    </span>
                    <span className="text-sm font-medium text-blue-600">
                      {count} event{count > 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Registration Trends */}
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration Trends</h3>

          {Object.keys(monthlyStats.registrationsByDate).length === 0 ? (
            <p className="text-gray-500 text-center py-8">No registrations this month</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(monthlyStats.registrationsByDate)
                .sort(([a], [b]) => b.localeCompare(a))
                .slice(0, 10)
                .map(([date, count]) => (
                  <div key={date} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">
                      {new Date(date).toLocaleDateString()}
                    </span>
                    <span className="text-sm font-medium text-green-600">
                      {count} registration{count > 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Aggregate Demographics & Top Locations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Gender Distribution */}
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Gender Distribution</h3>
          {monthlyStats.genderStats && Object.keys(monthlyStats.genderStats).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(monthlyStats.genderStats).map(([gender, count]) => (
                <div key={gender} className="flex items-center justify-between">
                  <span className="capitalize text-gray-600">{gender}</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${(count as number / monthlyStats.totalRegistrations) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">
                      {count as number}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No data available</p>
          )}
        </div>

        {/* Guest Type Distribution */}
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Guest Types</h3>
          {monthlyStats.guestTypeStats && Object.keys(monthlyStats.guestTypeStats).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(monthlyStats.guestTypeStats).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-gray-600">
                    {type === 'firstTime' ? 'First-time' : 'Returning'}
                  </span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className={`h-2 rounded-full ${type === 'firstTime' ? 'bg-orange-500' : 'bg-green-500'
                          }`}
                        style={{
                          width: `${(count as number / monthlyStats.totalRegistrations) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">
                      {count as number}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No data available</p>
          )}
        </div>

        {/* Top Locations */}
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Residences</h3>
          {monthlyStats.topLocations && monthlyStats.topLocations.length > 0 ? (
            <div className="space-y-3">
              {monthlyStats.topLocations.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-600 truncate max-w-[150px]" title={item.location}>
                    {item.location}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No data available</p>
          )}
        </div>
      </div>

      {/* Event-Specific Analytics */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Event-Specific Analytics</h3>
          {selectedEventId && (
            <ShareReportButton eventId={selectedEventId} />
          )}
        </div>

        <div className="mb-4">
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select an event to analyze...</option>
            {events
              .filter((event) => {
                const eventDate = new Date(event.date);
                return (
                  eventDate.getMonth() + 1 === selectedMonth &&
                  eventDate.getFullYear() === selectedYear
                );
              })
              .map((event) => (
                <option key={event._id} value={event._id}>
                  {event.name} - {new Date(event.date).toLocaleDateString()}
                </option>
              ))}
          </select>
        </div>

        {eventAnalytics && (
          <div className="space-y-6">
            {/* Event Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{eventAnalytics.totalRegistrations}</p>
                <p className="text-sm text-blue-700">Total Registrations</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{eventAnalytics.attendedCount}</p>
                <p className="text-sm text-green-700">Actually Attended</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{eventAnalytics.attendanceRate}%</p>
                <p className="text-sm text-purple-700">Attendance Rate</p>
              </div>
            </div>

            {/* Demographics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Gender Distribution</h4>
                <div className="space-y-2">
                  {Object.entries(eventAnalytics.demographics.gender).map(([gender, count]) => (
                    <div key={gender} className="flex items-center justify-between">
                      <span className="capitalize text-gray-600">{gender}</span>
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${(count / eventAnalytics.totalRegistrations) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-8 text-right">
                          {count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Guest Types</h4>
                <div className="space-y-2">
                  {Object.entries(eventAnalytics.demographics.guestType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-gray-600">
                        {type === 'firstTime' ? 'First-time' : 'Returning'}
                      </span>
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className={`h-2 rounded-full ${type === 'firstTime' ? 'bg-orange-500' : 'bg-green-500'
                              }`}
                            style={{
                              width: `${(count / eventAnalytics.totalRegistrations) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-8 text-right">
                          {count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {!selectedEventId && (
          <p className="text-gray-500 text-center py-8">Select an event to view detailed analytics</p>
        )}
      </div>
    </div>
  );
}

function ShareReportButton({ eventId }: { eventId: string }) {
  const generateLink = useMutation(api.reports.generateShareableLink);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const token = await generateLink({ eventId: eventId as any });
      const url = `${window.location.origin}/shared-report/${token}`;
      setGeneratedLink(url);
    } catch (error) {
      console.error("Failed to generate link:", error);
      alert("Failed to generate link");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      {!generatedLink ? (
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
        >
          {isLoading ? "Generating..." : "Share Report"}
        </button>
      ) : (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
          <input
            type="text"
            readOnly
            value={generatedLink}
            className="bg-transparent text-sm text-green-800 w-32 sm:w-48 truncate focus:outline-none"
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(generatedLink);
              alert("Link copied!");
            }}
            className="text-green-600 hover:text-green-800 text-xs font-bold uppercase"
          >
            Copy
          </button>
          <button
            onClick={() => setGeneratedLink(null)}
            className="text-gray-400 hover:text-gray-600 ml-2"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
